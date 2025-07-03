const fs = require('fs');
const path = require('path');

const sessionFile = path.join(__dirname, '../../toolkit/db/game.json');
let session = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile)) : {};

function saveSession() {
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
}

module.exports = {
  name: 'SiapaAku',
  command: ['siapakahaku'],
  tags: 'Game Menu',
  desc: 'Game Siapakah Aku? Coba tebak siapa aku dari petunjuk!',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const { siapaAkuSoal } = await global.loadFunc();

    try {
      const random = siapaAkuSoal[Math.floor(Math.random() * siapaAkuSoal.length)];
      const sent = await conn.sendMessage(chatId, {
        text: `*Siapakah Aku?*\n\n${random.soal}`,
      }, { quoted: msg });

      const soalId = sent.key.id;
      const created = Date.now();
      const nextIndex = Object.keys(session).length + 1;
      const sessionKey = `soal${nextIndex}`;

      session[sessionKey] = {
        type: 'siapakahaku',
        soal: random.soal,
        jawaban: random.jawaban.toLowerCase(),
        created,
        id: soalId
      };

      saveSession();

    } catch (e) {
      conn.sendMessage(chatId, {
        text: '⚠️ Gagal mengirim soal *Siapakah Aku?*',
      }, { quoted: msg });
      console.error('[SiapakahAku Error]', e);
    }
  }
};