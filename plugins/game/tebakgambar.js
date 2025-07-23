const axios = require('axios');

module.exports = {
  name: 'Tebak Gambar',
  command: ['tebakgambar', 'tebak'],
  tags: 'Game Menu',
  desc: 'Game tebak gambar',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId, senderId } = chatInfo;

    try {
      let session = global.load(global.pPath);
      session = global.bersih(session);
      global.save(session, global.pPath);

      const isPlaying = Object.values(session).some(
        v => v.status && v.chatId === chatId && v.Nomor === senderId
      );

      if (isPlaying)
        return conn.sendMessage(chatId, {
          text: `🎮 Kamu masih punya soal tebak gambar yang belum dijawab.\nSilakan jawab dulu.`,
        }, { quoted: msg });

      const { data } = await axios.get('https://raw.githubusercontent.com/Zyknn/database/main/tebakgambar.json');
      const soal = data[Math.floor(Math.random() * data.length)];

      const sent = await conn.sendMessage(chatId, {
        image: { url: soal.img },
        caption: `🧠 *Tebak Gambar!*\n\n${soal.deskripsi}\n\nBalas dengan jawaban kamu!`
      }, { quoted: msg });

      const sessionKey = `soal${Object.keys(session).length + 1}`;
      session[sessionKey] = {
        status: true,
        id: sent.key.id,
        Nomor: senderId,
        chatId,
        chance: 3,
        data: {
          soal: soal.deskripsi,
          tipe: 'tebakgambar',
          jawaban: soal.jawaban.toLowerCase()
        }
      };

      global.save(session, global.pPath);

    } catch (e) {
      console.error('[TEBAK-GAMBAR ERROR]', e);
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat memulai game. Coba lagi nanti.`
      }, { quoted: msg });
    }
  }
};