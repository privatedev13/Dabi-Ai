module.exports = {
  name: 'Tebakan',
  command: ['tebakan'],
  tags: 'Game Menu',
  desc: 'Tebak-tebakan receh berhadiah tawa!',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const { tebakSoal } = await global.loadFunc();

    try {
      const data = global.load(global.pPath);
      const gameData = data.FunctionGame || {};
      const random = tebakSoal[Math.floor(Math.random() * tebakSoal.length)];

      const sent = await conn.sendMessage(chatId, {
        text: `*Tebakan Lucu!*\n\n${random.soal}`,
      }, { quoted: msg });

      const sessionKey = `soal${Object.keys(gameData).length + 1}`;
      gameData[sessionKey] = {
        type: 'tebakan',
        soal: random.soal,
        jawaban: random.jawaban,
        created: Date.now(),
        id: sent.key.id,
        chance: 3,
        status: true
      };

      data.FunctionGame = gameData;
      global.save(data, global.pPath);

    } catch (e) {
      await conn.sendMessage(chatId, {
        text: '⚠️ Gagal mengirim soal tebakan.',
      }, { quoted: msg });
      console.error('[Tebakan Error]', e);
    }
  }
};