const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'savefile',
  command: ['savefile', 'sf'],
  tags: 'Owner Menu',
  desc: 'Menulis ulang file.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    if (!args.length) return conn.sendMessage(chatId, { text: 'Masukkan path file!' }, { quoted: msg });

    const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
    if (!quotedMessage) return conn.sendMessage(chatId, { text: 'Kutip pesan berisi teks!' }, { quoted: msg });

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) return conn.sendMessage(chatId, { text: 'Akses file di luar BaseBot tidak diizinkan!' }, { quoted: msg });

    let statusMsg;
    try {
      const status = await conn.sendMessage(chatId, { text: 'Menyimpan file...' }, { quoted: msg });
      statusMsg = status.key;

      fs.writeFileSync(filePath, quotedMessage, 'utf8');

      delete require.cache[require.resolve(filePath)];
      const updatedModule = require(filePath);
      if (global.plugins && updatedModule.name) global.plugins[updatedModule.name] = updatedModule;

      const savedText = `File berhasil disimpan\nPath: ${filePath.replace(baseDir + '/', '')}`;
      await conn.sendMessage(chatId, { text: savedText, edit: statusMsg }, { quoted: msg });

    } catch (error) {
      console.error(error);
      const errorMsg = { text: 'Terjadi kesalahan saat menyimpan file' };
      if (statusMsg) await conn.sendMessage(chatId, { ...errorMsg, edit: statusMsg });
      else await conn.sendMessage(chatId, { ...errorMsg, quoted: msg });
    }
  }
};