const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const dbPath = path.join(__dirname, './db/game.json');

function loadDb() {
  return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};
}

function saveDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function handleGame(conn, msg, chatId, textMessage) {
  try {
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
    const replyTo = contextInfo?.stanzaId;
    if (!replyTo) return false;

    const db = loadDb();
    const matchedKey = Object.keys(db).find(key => db[key].id === replyTo);
    if (!matchedKey) return false;

    const jawabanBenar = Array.isArray(db[matchedKey].jawaban)
      ? db[matchedKey].jawaban.map(j => j.toLowerCase())
      : [db[matchedKey].jawaban.toLowerCase()];
    const userJawab = textMessage.trim().toLowerCase();

    if (jawabanBenar.includes(userJawab)) {
      await conn.sendMessage(chatId, {
        text: `🎉 Jawaban benar! Kamu hebat!`,
      }, { quoted: msg });
    } else {
      await conn.sendMessage(chatId, {
        text: `Jawaban *salah*!\n\nJawaban nya adalah: ${jawabanBenar.join(', ')}`,
      }, { quoted: msg });
    }

    delete db[matchedKey];
    saveDb(db);
    return true;
  } catch (err) {
    console.error(chalk.redBright.bold('[ERROR] handleGame:'), err);
    return false;
  }
}

module.exports = { handleGame };