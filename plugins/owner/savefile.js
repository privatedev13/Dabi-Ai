import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export default {
  name: 'savefile',
  command: ['savefile', 'sf'],
  tags: 'Owner Menu',
  desc: 'Menulis ulang file.',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: 'Masukkan path file!' }, { quoted: msg });
    }

    const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
    if (!quotedMessage) {
      return conn.sendMessage(chatId, { text: 'Kutip pesan berisi teks!' }, { quoted: msg });
    }

    const baseDir = path.resolve('./');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: 'Akses file di luar BaseBot tidak diizinkan!' }, { quoted: msg });
    }

    let statusMsg;
    try {
      const status = await conn.sendMessage(chatId, { text: 'Menyimpan file...' }, { quoted: msg });
      statusMsg = status.key;

      fs.writeFileSync(filePath, quotedMessage, 'utf8');

      const fileUrl = pathToFileURL(filePath).href;
      const updatedModule = await import(`${fileUrl}?update=${Date.now()}`);

      if (global.plugins && updatedModule.default?.name) {
        global.plugins[updatedModule.default.name] = updatedModule.default;
      }

      const savedText = `File berhasil disimpan\nPath: ${filePath.replace(baseDir + '/', '')}`;
      await conn.sendMessage(chatId, { text: savedText, edit: statusMsg }, { quoted: msg });

    } catch (error) {
      console.error(error);
      const errorMsg = { text: 'Terjadi kesalahan saat menyimpan file' };
      if (statusMsg) {
        await conn.sendMessage(chatId, { ...errorMsg, edit: statusMsg });
      } else {
        await conn.sendMessage(chatId, { ...errorMsg, quoted: msg });
      }
    }
  }
};