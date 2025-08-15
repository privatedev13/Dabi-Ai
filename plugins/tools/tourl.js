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
    const { chatId } = chatInfo;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const main = msg.message;

    const media = quoted?.imageMessage || quoted?.videoMessage || main?.imageMessage || main?.videoMessage;
    if (!media) return conn.sendMessage(chatId, { text: '⚠️ Kirim atau balas gambar/video dengan caption *.tourl*' }, { quoted: msg });

    try {
      const buffer = await downloadMediaMessage(
        { message: quoted || main },
        'buffer',
        {},
        { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
      );
      if (!buffer) throw new Error('Media tidak terunduh!');

      const mime = media.mimetype || 'application/octet-stream';
      const ext = mime.includes('image') ? 'jpg' : mime.includes('video') ? 'mp4' : 'bin';

      const tempDir = path.join(__dirname, '../../temp/');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, `tourl_${Date.now()}.${ext}`);
      fs.writeFileSync(tempFile, buffer);

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(tempFile));

      const { data } = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
      fs.unlinkSync(tempFile);

      if (typeof data === 'string' && data.startsWith('https://'))
        return conn.sendMessage(chatId, { text: `✅ URL:\n${data}` }, { quoted: msg });

      throw new Error('Respons dari server tidak valid');
    } catch (err) {
      console.error('[ERROR] tourl:', err);
      conn.sendMessage(chatId, { text: `❌ Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  }
};