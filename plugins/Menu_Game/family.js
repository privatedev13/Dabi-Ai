const fs = require('fs');
const path = require('path');

const sessionFile = path.join(__dirname, '../../toolkit/db/game.json');
let session = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile)) : {};

function saveSession() {
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
}

module.exports = {
  name: 'Family-100',
  command: ['family'],
  tags: 'Game Menu',
  desc: 'Family-100 gameplay',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const { soalFamily } = await global.loadFunc();

    try {
      const randomSoal = soalFamily[Math.floor(Math.random() * soalFamily.length)];

      const sent = await conn.sendMessage(chatId, {
        text: `*Family 100*\n\n${randomSoal.soal}`
      }, { quoted: msg });

      const soalId = sent.key.id;
      const created = Date.now();

      const nextIndex = Object.keys(session).length + 1;
      const sessionKey = `soal${nextIndex}`;

      session[sessionKey] = {
        soal: randomSoal.soal,
        jawaban: randomSoal.jawaban,
        created,
        id: soalId
      };

      saveSession();

    } catch (e) {
      conn.sendMessage(chatId, {
        text: '⚠️ Terjadi kesalahan saat menjalankan game.'
      }, { quoted: msg });
    }
  }
};