export default {
  name: 'Family-100',
  command: ['family', 'family100'],
  tags: 'Game Menu',
  desc: 'Family-100 gameplay',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    const { soalFamily } = await global.loadFunctions();

    try {
      const session = global.load(global.pPath);
      if (!session.FunctionGame) session.FunctionGame = {};

      const randomSoal = soalFamily[Math.floor(Math.random() * soalFamily.length)];
      const sent = await conn.sendMessage(chatId, { text: `*Family 100*\n\n${randomSoal.soal}` }, { quoted: msg });

      const soalId = sent.key.id;
      const sessionKey = `soal${Object.keys(session.FunctionGame).length + 1}`;

      session.FunctionGame[sessionKey] = {
        noId: senderId,
        soal: randomSoal.soal,
        jawaban: randomSoal.jawaban,
        created: Date.now(),
        id: soalId,
        chance: 3
      };

      global.save(session, global.pPath);
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menjalankan game.' }, { quoted: msg });
    }
  }
};