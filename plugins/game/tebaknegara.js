export default {
  name: 'tebaknegara',
  command: ['tebaknegara'],
  tags: 'Game Menu',
  desc: 'Game Tebak Negara – Coba tebak nama negara dari petunjuk!',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const { chatId, senderId } = chatInfo;
    const { tebaknegara } = await global.loadFunctions();

    try {
      const data = global.load(global.pPath);
      const gameData = data.FunctionGame || {};
      const random = tebaknegara[Math.floor(Math.random() * tebaknegara.length)];

      const sent = await conn.sendMessage(chatId, {
        text: `*Tebak Negara*\n\n${random.soal}\n\n⏳ Jawab dengan nama negara yang benar!`
      }, { quoted: msg });

      const sessionKey = `soal${Object.keys(gameData).length + 1}`;
      gameData[sessionKey] = {
        noId: senderId,
        type: commandText,
        soal: random.soal,
        jawaban: random.jawaban.toLowerCase(),
        created: Date.now(),
        id: sent.key.id,
        chance: 3,
        status: true
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);
    } catch (e) {
      await conn.sendMessage(chatId, { text: '⚠️ Gagal mengirim soal *Tebak Negara*' }, { quoted: msg });
      console.error('[TebakNegara Error]', e);
    }
  }
};