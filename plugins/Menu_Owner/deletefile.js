const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'deletefile',
  command: ['deletefile', 'df'],
  tags: 'Owner Menu',
  desc: 'Menghapus file/folder',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    if (!args[0]) return conn.sendMessage(chatId, { text: '⚠️ Masukkan nama file yang ingin dihapus!' }, { quoted: message });

    const baseDir = path.join(__dirname, '../../');
    const fileName = args[0];
    const filePath = path.join(baseDir, fileName);

    console.log(`Mencoba menghapus file di path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`File tidak ditemukan di path: ${filePath}`);
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan!' }, { quoted: message });
    }
    
    try {
      fs.unlinkSync(filePath);
      conn.sendMessage(chatId, { text: `✅ File *${fileName}* berhasil dihapus!` }, { quoted: message });

      await new Promise(resolve => setTimeout(resolve, 2000));

      await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: message });

      await new Promise(resolve => setTimeout(resolve, 3000));

      process.exit(1);
    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menghapus file!' }, { quoted: message });
    }
  }
};