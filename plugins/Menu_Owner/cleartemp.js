const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'cleartemp',
  command: ['cleartemp', 'ctemp'],
  tags: 'Owner Menu',
  desc: 'Membersihkan folder temp',

  isOwner: false,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) {
      return conn.sendMessage(chatId, { text: '📂 Folder temp tidak ditemukan.' }, { quoted: message });
    }

    try {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        return conn.sendMessage(chatId, { text: '✅ Folder temp sudah bersih.' }, { quoted: message });
      }

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      });

      return conn.sendMessage(chatId, { text: '✅ Semua file dalam folder temp berhasil dihapus.' }, { quoted: message });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, { text: '❌ Gagal membersihkan folder temp.' }, { quoted: message });
    }
  }
};