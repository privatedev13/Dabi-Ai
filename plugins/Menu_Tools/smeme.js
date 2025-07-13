const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeExifImg } = require('../../toolkit/exif');
const { upUguu, getBufMime, genMemeBuf } = require('../../toolkit/scrape/smeme');

module.exports = {
  name: 'smeme',
  command: ['smeme', 'stickermeme'],
  tags: 'Tools Menu',
  desc: 'Membuat stiker meme dari gambar dengan teks atas dan bawah.',
  prefix: true,

  run: async (conn, msg, {
    textMessage,
    commandText,
    args,
    chatInfo,
    prefix
  }) => {
    const { chatId } = chatInfo;
    const quoted = msg.quoted;

    try {
      const isImage = msg.type === 'imageMessage' || 
                      (msg.type === 'documentMessage' && msg.mimetype?.startsWith('image/')) || 
                      msg.type === 'stickerMessage';

      const isQuotedImage = quoted?.type === 'imageMessage' || 
                            (quoted?.type === 'documentMessage' && quoted?.mimetype?.startsWith('image/')) || 
                            quoted?.type === 'stickerMessage';

      let imageBuffer, imageMime, imageUrl;

      const getMediaBufferAndMime = async (mData) => {
        let mime = '';
        let content = null;

        if (mData.message?.imageMessage) {
          mime = mData.message.imageMessage.mimetype;
          content = mData.message.imageMessage;
        } else if (mData.message?.documentMessage?.mimetype?.startsWith('image/')) {
          mime = mData.message.documentMessage.mimetype;
          content = mData.message.documentMessage;
        } else if (mData.message?.stickerMessage) {
          mime = mData.message.stickerMessage.mimetype;
          content = mData.message.stickerMessage;
        }

        if (!content || !mime || (!mime.startsWith('image/') && !mime.includes('webp'))) {
          throw new Error("Pesan bukan gambar atau stiker valid.");
        }

        const stream = await downloadContentFromMessage(content, mime.includes('webp') ? 'sticker' : mime.split('/')[0]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return { buffer, mime };
      };

      if (isImage) {
        const data = await getMediaBufferAndMime(msg);
        imageBuffer = data.buffer;
        imageMime = data.mime;
      } else if (isQuotedImage) {
        const data = await getMediaBufferAndMime(quoted);
        imageBuffer = data.buffer;
        imageMime = data.mime;
      } else if (textMessage && /^https?:\/\/.*\.(jpe?g|png|webp|gif|bmp)$/i.test(textMessage.split(' ')[0])) {
        const data = await getBufMime(textMessage.split(' ')[0]);
        imageBuffer = data.buffer;
        imageMime = data.mime;
        imageUrl = textMessage.split(' ')[0];
      }

      if (!imageBuffer && !imageUrl) {
        return conn.sendMessage(chatId, { text: `Kirim gambar atau balas gambar dengan caption.\nContoh: *${prefix}${commandText} atas|bawah*` }, { quoted: msg });
      }

      if (imageBuffer && (!imageMime || !/image\/(jpe?g|png|webp)/i.test(imageMime))) {
        return conn.sendMessage(chatId, { text: `Format gambar tidak didukung (${imageMime}). Gunakan JPG/PNG/WEBP.` }, { quoted: msg });
      }

      const [atas, bawah] = textMessage?.includes('|') ? textMessage.split('|').map(v => v.trim()) : ['-', textMessage?.trim() || '-'];

      if (!atas && !bawah) {
        return conn.sendMessage(chatId, { text: `Format: teks_atas|teks_bawah\nContoh: *${prefix}${commandText}* atas|bawah` }, { quoted: msg });
      }

      if (imageBuffer) {
        let ext = imageMime.split('/')[1];
        if (ext === 'jpeg') ext = 'jpg';
        imageUrl = await upUguu(imageBuffer, `upload.${ext}`, imageMime);
      }

      if (!imageUrl) throw new Error('Gagal mendapatkan URL gambar.');

      const memeBuffer = await genMemeBuf(imageUrl, atas || '-', bawah || '-');

      const sticker = await writeExifImg(
        { mimetype: 'image/png', data: memeBuffer },
        { packName: 'Sticker By', packPublish: 'DanzzAraAra' }
      );

      await conn.sendMessage(chatId, { sticker }, { quoted: msg });

    } catch (e) {
      console.error('smeme error:', e);
      conn.sendMessage(chatId, { text: `Terjadi kesalahan:\n${e.message}` }, { quoted: msg });
    }
  }
};