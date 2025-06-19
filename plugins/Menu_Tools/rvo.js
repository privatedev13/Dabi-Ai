const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'rvo',
  command: ['rvo', 'readviewonce'],
  tags: 'Tools Menu',
  desc: 'Mengekstrak media sekali lihat.',
  prefix: true,
  isPremium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg) {
        return conn.sendMessage(chatId, { text: 'Balas ke media (View Once atau biasa) yang mau diambil.' }, { quoted: msg });
      }

      let viewOnce = 
        quotedMsg?.viewOnceMessageV2Extension?.message ||
        quotedMsg?.viewOnceMessageV2?.message ||
        quotedMsg?.viewOnceMessage?.message ||
        quotedMsg;

      let mediaType, mediaMessage;

      if (viewOnce?.imageMessage) {
        mediaType = 'image';
        mediaMessage = viewOnce.imageMessage;
      } else if (viewOnce?.videoMessage) {
        mediaType = 'video';
        mediaMessage = viewOnce.videoMessage;
      } else if (viewOnce?.audioMessage) {
        mediaType = 'audio';
        mediaMessage = viewOnce.audioMessage;
      } else {
        return conn.sendMessage(chatId, { text: 'Media tidak didukung untuk diekstrak.' }, { quoted: msg });
      }

      if (!mediaMessage?.mediaKey) {
        return conn.sendMessage(chatId, { text: 'Media pernah dibuka dan tidak dapat diambil lagi.' }, { quoted: msg });
      }

      try {
        const buffer = await downloadMediaMessage(
          { message: { [`${mediaType}Message`]: mediaMessage } },
          'buffer',
          {},
          { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
        );

        if (!buffer) {
          return conn.sendMessage(chatId, { text: 'Gagal mengunduh media.' }, { quoted: msg });
        }

        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const filename = path.join(tempDir, `${Date.now()}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`);
        fs.writeFileSync(filename, buffer);

        const caption = mediaMessage.caption || '';

        await conn.sendMessage(chatId, {
          [mediaType]: { url: filename },
          caption: caption ? `*Pesan:* ${caption}` : 'Media berhasil diambil.',
        }, { quoted: msg });
      } catch (error) {
        console.error('Error processing media:', error);
        conn.sendMessage(chatId, { 
          text: `Gagal memproses media: ${error.message || error}` 
        }, { quoted: msg });
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
};