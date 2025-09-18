import fs from 'fs';
import path from 'path';

export default {
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
    if (!args[0]) {
      return conn.sendMessage(chatId, { text: 'Masukkan nama file!' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: 'Akses file di luar BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    if (!fs.existsSync(filePath)) {
      return conn.sendMessage(chatId, { text: 'File tidak ditemukan!' }, { quoted: msg });
    }

    let statusMsg;
    try {
      statusMsg = (await conn.sendMessage(chatId, { text: 'Menghapus file...' }, { quoted: msg })).key;

      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }

      if (filePath.endsWith('.js') && global.plugins) {
        const pluginName = path.basename(filePath, '.js');
        for (const name in global.plugins) {
          const p = global.plugins[name];
          if (p?.name === pluginName || p?.__filename === filePath) {
            delete global.plugins[name];
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