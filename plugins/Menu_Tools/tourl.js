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

  run: async (conn, msg, {
    chatInfo
  }) => {
    try {
      const { chatId } = chatInfo;
      const quoted = msg.quoted;
      const targetMsg = quoted || msg;

      const mime =
        quoted?.mimetype ||
        targetMsg.message?.imageMessage?.mimetype ||
        targetMsg.message?.videoMessage?.mimetype ||
        '';

      if (!/image|video/.test(mime)) {
        return conn.sendMessage(chatId, { text: '⚠️ Balas atau kirim gambar/video dengan caption *.tourl*' }, { quoted: msg });
      }

      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, {
        logger: conn.logger,
        reuploadRequest: conn.updateMediaMessage,
      });

      if (!buffer) throw new Error('Gagal mengunduh media');

      const form = new FormData();
      const tempFileName = `temp_${Date.now()}.${mime.includes('image') ? 'jpg' : 'mp4'}`;
      const tempPath = path.join(__dirname, tempFileName);

      fs.writeFileSync(tempPath, buffer);
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(tempPath));

      const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
      });

      fs.unlinkSync(tempPath);

      if (res.data && typeof res.data === 'string' && res.data.startsWith('https://')) {
        return conn.sendMessage(chatId, { text: `✅ URL:\n${res.data}` }, { quoted: msg });
      } else {
        throw new Error('Gagal mengupload ke Catbox');
      }
    } catch (e) {
      console.error('[ERROR] tourl:', e);
      return conn.sendMessage(msg.key.remoteJid, { text: '❌ Terjadi kesalahan saat mengupload media.' }, { quoted: msg });
    }
  }
};