module.exports = {
  name: 'Susun Kata',
  command: ['susunkata'],
  tags: 'Game Menu',
  desc: 'Game susun kata',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo;
    const { susunKata } = await global.loadFunc();
    const user = msg.sender;

    let session = global.load(global.pPath);
    session = global.bersih(session);
    global.save(session, global.pPath);

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

    const sessionKey = `soal${Object.keys(session).length + 1}`;
    session[sessionKey] = {
      status: true,
      id: sent.key.id,
      Nomor: user,
      chance: 3,
      chatId,
      data: {
        soal: soal.soal,
        tipe: soal.tipe,
        jawaban: soal.jawaban.toLowerCase()
      }
    };

    global.save(session, global.pPath);
  }
};