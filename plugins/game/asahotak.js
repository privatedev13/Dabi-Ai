export default {
  name: 'asahotak',
  command: ['asahotak'],
  tags: 'Game Menu',
  desc: 'Game Asah Otak – Tebak jawaban dari soal!',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    commandText
  }) => {
    const { chatId, senderId } = chatInfo;
    const { asahotak } = await global.loadFunctions();

    try {
      const data = global.load(global.pPath);
      const gameData = data.FunctionGame || {};
      const random = asahotak[Math.floor(Math.random() * asahotak.length)];

      const sent = await conn.sendMessage(chatId, {
        text: `*Asah Otak*\n\n${random.soal}\n\n⏳ Jawab dengan benar sebelum kehabisan kesempatan!`
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
      await conn.sendMessage(chatId, { text: '⚠️ Gagal mengirim soal *Asah Otak*' }, { quoted: msg });
      console.error('[AsahOtak Error]', e);
    }
  }
};