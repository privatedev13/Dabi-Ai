const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'tourl',
  command: ['tourl'],
  tags: 'Tools Menu',
  desc: 'Mengubah media menjadi URL.',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId } = chatInfo;

      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMessage?.imageMessage || msg.message?.imageMessage;
      const isVideo = quotedMessage?.videoMessage || msg.message?.videoMessage;

      if (!isImage && !isVideo) {
        return conn.sendMessage(chatId, {
          text: '⚠️ Balas atau kirim gambar/video dengan caption *.tourl*'
        }, { quoted: msg });
      }

      let mediaBuffer;
      try {
        mediaBuffer = await downloadMediaMessage(
          { message: quotedMessage || msg.message },
          'buffer',
          {},
          {
            logger: conn.logger,
            reuploadRequest: conn.updateMediaMessage,
          }
        );
        if (!mediaBuffer) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(chatId, {
          text: `❌ Gagal mengunduh media! ${error.message}`
        }, { quoted: msg });
      }

      const mimeType = isImage?.mimetype || isVideo?.mimetype || 'application/octet-stream';
      const extension = mimeType.includes('image') ? 'jpg' : mimeType.includes('video') ? 'mp4' : 'bin';
      const tempFileName = `temp_${Date.now()}.${extension}`;
      const tempPath = path.join(__dirname, tempFileName);

      fs.writeFileSync(tempPath, mediaBuffer);

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(tempPath));

      let uploadResult;
      try {
        const response = await axios.post('https://catbox.moe/user/api.php', form, {
          headers: form.getHeaders()
        });
        uploadResult = response.data;
      } catch (err) {
        fs.unlinkSync(tempPath);
        throw new Error('Gagal mengupload ke Catbox');
      }

      fs.unlinkSync(tempPath);

      if (typeof uploadResult === 'string' && uploadResult.startsWith('https://')) {
        return conn.sendMessage(chatId, {
          text: `✅ URL:\n${uploadResult}`
        }, { quoted: msg });
      } else {
        throw new Error('Respons dari server tidak valid');
      }
    } catch (e) {
      console.error('[ERROR] tourl:', e);
      return conn.sendMessage(msg.key.remoteJid, {
        text: '❌ Terjadi kesalahan saat mengupload media.'
      }, { quoted: msg });
    }
  }
};