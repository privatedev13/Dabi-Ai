const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'catat',
  command: ['addcatat', 'delcatat'],
  tags: 'Tools Menu',
  desc: 'Tambah atau hapus nama catatan',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, '{}');
      const catatan = JSON.parse(fs.readFileSync(catatanPath));

      if (commandText === 'addcatat') {
        const nama = args[0];
        if (!nama) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}addcatat NamaCatatan` }, { quoted: message });
        if (catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* sudah ada.` }, { quoted: message });
        catatan[nama] = {};
        fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
        conn.sendMessage(chatId, { text: `Berhasil membuat catatan *${nama}*.` }, { quoted: message });
      } else if (commandText === 'delcatat') {
        const nama = args[0];
        if (!nama) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}delcatat NamaCatatan` }, { quoted: message });
        if (!catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: message });
        delete catatan[nama];
        fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
        conn.sendMessage(chatId, { text: `Berhasil menghapus catatan *${nama}*.` }, { quoted: message });
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};