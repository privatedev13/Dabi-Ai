const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

module.exports = {
  name: 'bell',
  command: ['bell'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan fitur bell',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;
      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, {
          text: `Gunakan format: ${prefix + commandText} <on/off>`
        }, { quoted: msg });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const settingValue = args[0].toLowerCase() === 'on';

      if (isGroup) {
        const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
        if (!groupData) {
          return conn.sendMessage(chatId, {
            text: 'Grup ini belum terdaftar dalam database.'
          }, { quoted: msg });
        }

        groupData.bell = settingValue;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        return conn.sendMessage(chatId, {
          text: `Fitur Bell untuk grup ini telah *${settingValue ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: msg });

      } else {
        const userKey = Object.keys(db.Private).find(name => db.Private[name].Nomor === senderId);
        if (!userKey) {
          return conn.sendMessage(chatId, {
            text: 'Nomor kamu belum terdaftar dalam database.'
          }, { quoted: msg });
        }

        db.Private[userKey].bell = settingValue;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        return conn.sendMessage(chatId, {
          text: `Fitur Bell untuk kamu telah *${settingValue ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: msg });
      }

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg });
    }
  }
};