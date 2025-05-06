const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'Sticker Watermark',
  command: ['swm', 'swn'],
  tags: 'Tools Menu',
  desc: 'Mengubah watermark (author & pack) pada stiker',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      const inputText = args.join(' ').trim();

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMessage?.stickerMessage;

      if (!stickerMessage || !inputText) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text:
              'Gunakan:\n' +
              '- *swm <author> | <pack>* → Mengubah author & pack\n' +
              '- *swn <author>* → Hanya mengubah author\n' +
              'Harus reply ke stiker!',
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal mengunduh stiker! ${error.message}` },
          { quoted: message }
        );
      }

      let author = 'Unknown';
      let pack = footer;

      if (inputText.includes('|')) {
        const splitText = inputText.split('|').map(t => t.trim());
        author = splitText[0] || author;
        pack = splitText[1] || pack;
      } else if (inputText) {
        author = inputText;
      }

      let sticker;
      try {
        sticker = new Sticker(media, {
          pack,
          author,
          type: StickerTypes.FULL,
          quality: 100,
        });

        const buffer = await sticker.toBuffer();
        await conn.sendMessage(message.key.remoteJid, { sticker: buffer }, { quoted: message });
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: message }
        );
      }
    } catch (error) {
      conn.sendMessage(
        message.key.remoteJid,
        { text: `❌ Terjadi kesalahan! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin swm/swn:', error);
    }
  },
};