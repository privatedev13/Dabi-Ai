const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'catat',
  command: ['addcatat', 'delcatat'],
  tags: 'Tools Menu',
  desc: 'Tambah atau hapus nama catatan',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, msg))) return;
      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, '{}');
      const catatan = JSON.parse(fs.readFileSync(catatanPath));

      if (commandText === 'addcatat') {
        const nama = args[0];
        if (!nama) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}addcatat NamaCatatan` }, { quoted: msg });
        if (catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* sudah ada.` }, { quoted: msg });
        catatan[nama] = {};
        fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
        conn.sendMessage(chatId, { text: `Berhasil membuat catatan *${nama}*.` }, { quoted: msg });
      } else if (commandText === 'delcatat') {
        const nama = args[0];
        if (!nama) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}delcatat NamaCatatan` }, { quoted: msg });
        if (!catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg });
        delete catatan[nama];
        fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
        conn.sendMessage(chatId, { text: `Berhasil menghapus catatan *${nama}*.` }, { quoted: msg });
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error}`,
        quoted: msg,
      });
    }
  }
};