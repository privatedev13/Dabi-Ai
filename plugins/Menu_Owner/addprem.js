const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'addprem',
  command: ['addprem'],
  tags: 'Owner Menu',
  desc: 'Menambahkan pengguna ke status premium dengan durasi tertentu',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!(await onlyOwner(module.exports, conn, message))) return;

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `📌 Gunakan format yang benar:\n\n*${prefix}${commandText} @tag 7h*\natau\n*${prefix}${commandText} nomor 7h*`
        }, { quoted: message });
      }

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ Private: {} }, null, 2));
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        db.Private = {};
      }

      let targetNumber;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        targetNumber = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }

      const durationInput = args[1];
      const match = durationInput.match(/^(\d+)([hmd])$/);
      if (!match) {
        return conn.sendMessage(chatId, {
          text: `❗ Format durasi tidak valid! Gunakan format seperti 7h (jam), 1d (hari), atau 30m (menit).`
        }, { quoted: message });
      }

      const value = parseInt(match[1]);
      const unit = match[2];

      let durationMs;
      switch (unit) {
        case 'h':
          durationMs = value * 60 * 60 * 1000;
          break;
        case 'd':
          durationMs = value * 24 * 60 * 60 * 1000;
          break;
        case 'm':
          durationMs = value * 60 * 1000;
          break;
      }

      let userKey = Object.keys(db.Private).find((key) => db.Private[key].Nomor === targetNumber);

      if (!userKey) {
        return conn.sendMessage(chatId, {
          text: `❌ Pengguna tidak ada di database!`
        }, { quoted: message });
      }

      db.Private[userKey].premium = {
        prem: true,
        time: durationMs,
      };

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Pengguna *${userKey}* (${targetNumber}) telah menjadi *Premium* selama ${value} ${unit === 'h' ? 'jam' : unit === 'd' ? 'hari' : 'menit'}!`
      }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin addprem.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menambahkan status premium!' }, { quoted: message });
    }
  },
};