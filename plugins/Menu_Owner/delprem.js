const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'delprem',
  command: ['delprem', 'deletepremium'],
  tags: 'Owner Menu',
  desc: 'Menghapus status premium dari pengguna.',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!(await onlyOwner(module.exports, conn, message))) return;

      if (args.length === 0 && !message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        return conn.sendMessage(chatId, {
          text: `📌 Gunakan format yang benar:\n\n*${prefix}delprem @tag*\natau\n*${prefix}delprem nomor*`
        }, { quoted: message });
      }

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database Private tidak valid!' }, { quoted: message });
      }

      let targetNumber;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        targetNumber = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      }

      let userKey = Object.keys(db.Private).find((key) => db.Private[key].Nomor === targetNumber);

      if (!userKey) {
        return conn.sendMessage(chatId, { text: `❌ Pengguna tidak ada di database!` }, { quoted: message });
      }

      if (!db.Private[userKey].premium || !db.Private[userKey].premium.prem) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Pengguna *${userKey}* tidak memiliki status premium.`
        }, { quoted: message });
      }

      db.Private[userKey].premium.prem = false;
      db.Private[userKey].premium.time = 0;

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Status premium *${userKey}* telah dihapus.`
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin delprem.js:', error);
      conn.sendMessage(chatId, {
        text: `⚠️ Terjadi kesalahan saat menghapus status premium!`
      }, { quoted: message });
    }
  },
};