import fs from 'fs';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { writeExifImg } from '../../toolkit/exif.js';

export default {
  name: 'Sticker Watermark',
  command: ['swm', 'swn'],
  tags: 'Tools Menu',
  desc: 'Mengubah watermark stiker',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage;
    const input = args.join(' ').trim();

    if (!stickerMsg || !input) {
      return conn.sendMessage(chatId, {
        text: 'Gunakan:\n' +
              '- *swm <author> | <pack>* → Mengubah author & pack\n' +
              '- *swn <author>* → Hanya mengubah author\n' +
              'Harus reply ke stiker!'
      }, { quoted: msg });
    }

    try {
      const media = await downloadMediaMessage({ message: quoted }, 'buffer', {});
      if (!media) throw new Error('Media tidak terunduh!');

      let author = 'Unknown', pack = footer;
      if (input.includes('|')) {
        [author, pack] = input.split('|').map(t => t.trim());
        author ||= 'Unknown';
        pack ||= footer;
      } else {
        author = input;
      }

      const stickerPath = await writeExifImg(media, { author, packname: pack }, true);
      if (!stickerPath) throw new Error('Exif tidak berhasil ditulis!');

      const stickerBuffer = fs.readFileSync(stickerPath);
      await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });

    } catch (err) {
      conn.sendMessage(chatId, { text: `❌ ${err.message}` }, { quoted: msg });
      console.error('[ERROR] swm/swn:', err);
    }
  }
}