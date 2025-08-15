const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'deletefile',
  command: ['deletefile', 'df'],
  tags: 'Owner Menu',
  desc: 'Menghapus file/folder',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;
    if (!args[0]) return conn.sendMessage(chatId, { text: 'Masukkan nama file!' }, { quoted: msg });

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));
    if (!filePath.startsWith(baseDir)) return conn.sendMessage(chatId, { text: 'Akses file di luar BaseBot tidak diizinkan!' }, { quoted: msg });
    if (!fs.existsSync(filePath)) return conn.sendMessage(chatId, { text: 'File tidak ditemukan!' }, { quoted: msg });

    let statusMsg;
    try {
      statusMsg = (await conn.sendMessage(chatId, { text: 'Menghapus file...' }, { quoted: msg })).key;
      fs.unlinkSync(filePath);

      if (filePath.endsWith('.js')) {
        delete require.cache[require.resolve(filePath)];
        if (global.plugins) {
          for (const name in global.plugins) {
            const p = global.plugins[name];
            if (p?.__filename === filePath || p?.name === path.basename(filePath, '.js')) delete global.plugins[name];
          }
        }
      }

      await conn.sendMessage(chatId, { text: `File ${args.join(' ')} berhasil dihapus`, edit: statusMsg }, { quoted: msg });
    } catch (e) {
      console.error(e);
      const errMsg = { text: 'Terjadi kesalahan saat menghapus file' };
      await conn.sendMessage(chatId, statusMsg ? { ...errMsg, edit: statusMsg } : { ...errMsg, quoted: msg });
    }
  }
};