module.exports = {
  name: 'SiapaAku',
  command: ['siapakahaku'],
  tags: 'Game Menu',
  desc: 'Game Siapakah Aku? Coba tebak siapa aku dari petunjuk!',
  prefix: true,

  run: async (conn, msg, {
    chatInfo
  }) => {
    const { chatId } = chatInfo;
    const { siapaAkuSoal } = await global.loadFunc();

    try {
      const session = global.load(global.pPath);
      const random = siapaAkuSoal[Math.floor(Math.random() * siapaAkuSoal.length)];

      const sent = await conn.sendMessage(chatId, {
        text: `*Siapakah Aku?*\n\n${random.soal}`,
      }, { quoted: msg });

      const sessionKey = `soal${Object.keys(session).length + 1}`;
      session[sessionKey] = {
        type: 'siapakahaku',
        soal: random.soal,
        jawaban: random.jawaban.toLowerCase(),
        created: Date.now(),
        id: sent.key.id,
        chance: 3
      };

      global.save(session, global.pPath);

    } catch (e) {
      await conn.sendMessage(chatId, {
        text: '⚠️ Gagal mengirim soal *Siapakah Aku?*',
      }, { quoted: msg });
      console.error('[SiapakahAku Error]', e);
    }
  }
};