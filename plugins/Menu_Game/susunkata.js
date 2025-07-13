const fs = require('fs');
const path = require('path');

const sessionFile = path.join(__dirname, '../../toolkit/db/game.json');

function loadSession() {
  return fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile)) : {};
}

function saveSession(data) {
  fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2));
}

function cleanSession(data) {
  for (const key in data) {
    const item = data[key];
    if (!item || item.status !== true) {
      delete data[key];
    }
  }
  return data;
}

module.exports = {
  name: 'Susun Kata',
  command: ['susunkata'],
  tags: 'Game Menu',
  desc: 'Game susun kata',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const { susunKata } = await global.loadFunc();
    const user = msg.sender;

    let session = loadSession();
    session = cleanSession(session);
    saveSession(session);

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

    const soalId = sent.key.id;
    const nextIndex = Object.keys(session).length + 1;
    const sessionKey = `soal${nextIndex}`;

    session[sessionKey] = {
      status: true,
      id: soalId,
      Nomor: user,
      chatId,
      data: {
        soal: soal.soal,
        tipe: soal.tipe,
        jawaban: soal.jawaban.toLowerCase()
      }
    };

    saveSession(session);
  }
};