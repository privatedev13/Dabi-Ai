const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'intro',
  command: ['intro'],
  tags: 'Group Menu',
  desc: 'Mengirimkan pesan sambutan jika grup terdaftar di database.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!isGroup) {
        return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya dapat digunakan di grup.' }, { quoted: message });
      }

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Grup || typeof db.Grup !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Data grup kosong!' }, { quoted: message });
      }

      let foundGroup = null;

      for (const [nama, data] of Object.entries(db.Grup)) {
        if (data.Id === chatId && data.Welcome?.welcome === true) {
          foundGroup = data;
          break;
        }
      }

      if (!foundGroup) {
        return conn.sendMessage(chatId, {
          text: '❌ Grup ini tidak terdaftar atau fitur welcome tidak aktif.',
        }, { quoted: message });
      }

      const welcomeText = foundGroup.Welcome.welcomeText || 'Selamat datang!';

      conn.sendMessage(chatId, {
        text: welcomeText,
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin intro.js:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: '⚠️ Terjadi kesalahan saat mengirim pesan intro!',
      }, { quoted: message });
    }
  },
};