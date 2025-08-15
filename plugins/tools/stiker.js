const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeExifImg, writeExifVid } = require('../../toolkit/exif.js');
const fs = require('fs');

module.exports = {
  name: 'stiker',
  command: ['s', 'stiker', 'sticker'],
  tags: 'Tools Menu',
  desc: 'Membuat sticker',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isImage = quoted?.imageMessage || msg.message?.imageMessage;
    const isVideo = quoted?.videoMessage || msg.message?.videoMessage;

    if (!isImage && !isVideo) {
      return conn.sendMessage(chatId, {
        text: `Balas gambar/video dengan caption *s*, *stiker*, atau *sticker* ` +
              `atau kirim langsung media dengan caption yang sama!`
      }, { quoted: msg });
    }

    let media;
    try {
      media = await downloadMediaMessage({ message: quoted || msg.message }, 'buffer', {});
      if (!media) throw new Error('Media tidak terunduh!');
    } catch (e) {
      return conn.sendMessage(chatId, { text: `❌ Gagal mengunduh media! ${e.message}` }, { quoted: msg });
    }

    const metadata = { packname: footer, author: msg.pushName };
    let stickerPath;

    try {
      stickerPath = isImage ? await writeExifImg(media, metadata) : await writeExifVid(media, metadata);
      if (!stickerPath) throw new Error('Gagal membuat stiker!');
    } catch (e) {
      return conn.sendMessage(chatId, { text: `❌ Gagal membuat stiker! ${e.message}` }, { quoted: msg });
    }

    const stickerBuffer = fs.readFileSync(stickerPath);
    await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
  }
};