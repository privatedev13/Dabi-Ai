import fs from 'fs';
import path from 'path';

export default {
  name: 'getfile',
  command: ['getfile', 'gf'],
  tags: 'Owner Menu',
  desc: 'Menampilkan isi file dalam bentuk teks',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan path file yang ingin diambil!' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    if (!fs.existsSync(filePath)) {
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan!' }, { quoted: msg });
    }

    if (fs.lstatSync(filePath).isDirectory()) {
      return conn.sendMessage(chatId, { text: '❌ Path adalah direktori, bukan file!' }, { quoted: msg });
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const filePathDisplay = filePath.replace(baseDir + '/', '');

      await conn.sendMessage(chatId, { text: `📄 *Path File:* ${filePathDisplay}` }, { quoted: msg });

      const maxLength = 4000;
      for (let i = 0; i < fileContent.length; i += maxLength) {
        const chunk = fileContent.slice(i, i + maxLength);
        await conn.sendMessage(chatId, { text: chunk }, { quoted: msg });
      }
    } catch (e) {
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat membaca file!' }, { quoted: msg });
    }
  }
};