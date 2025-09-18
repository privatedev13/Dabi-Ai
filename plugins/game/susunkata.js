export default {
  name: 'Susun Kata',
  command: ['susunkata'],
  tags: 'Game Menu',
  desc: 'Game susun kata',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    const { susunKata } = await global.loadFunctions();
    const user = senderId;

    let data = global.load(global.pPath);
    let session = global.bersih(data.FunctionGame);

    const existing = Object.entries(session).find(([_, v]) =>
      v.status && v.chatId === chatId && v.Nomor === user
    );

    if (existing) {
      return conn.sendMessage(chatId, {
        text: `🕹️ Kamu masih punya soal yang belum dijawab!\nSilakan jawab dulu.`,
      }, { quoted: msg });
    }

    const soal = susunKata[Math.floor(Math.random() * susunKata.length)];

    const sent = await conn.sendMessage(chatId, {
      text: `🎮 *Susun Kata!*\n\nSusun huruf berikut menjadi kata:\n➤ ${soal.soal}\nKategori: ${soal.tipe}`,
    }, { quoted: msg });

    const sessionKey = `soal${Object.keys(data.FunctionGame).length + 1}`;
    data.FunctionGame[sessionKey] = {
      noId: user,
      status: true,
      id: sent.key.id,
      chance: 3,
      chatId,
      data: {
        soal: soal.soal,
        tipe: soal.tipe,
        jawaban: soal.jawaban.toLowerCase()
      }
    };

    global.save(data, global.pPath);
  }
};