const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'tourl',
  command: ['tourl'],
  tags: 'Tools Menu',
  desc: 'Mengubah media menjadi URL menggunakan Catbox.moe',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId;

      const messageText =
        message.body ||
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

      if (!messageText) return;

      const prefix = isPrefix.find(p => messageText.startsWith(p));
      if (!prefix) return;

      const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const quoted = message.quoted;
      const targetMsg = quoted || message;

      const mime =
        quoted?.mimetype ||
        targetMsg.message?.imageMessage?.mimetype ||
        targetMsg.message?.videoMessage?.mimetype ||
        '';

      if (!/image|video/.test(mime)) {
        return conn.sendMessage(chatId, { text: 'Reply atau kirim gambar/video dengan caption *.tourl*' }, { quoted: message });
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
        return conn.sendMessage(chatId, { text: `✅ URL:\n${res.data}` }, { quoted: message });
      } else {
        throw new Error('Gagal mengupload ke Catbox');
      }
    } catch (e) {
      console.error(e);
      conn.sendMessage(message.key.remoteJid, { text: '❌ Terjadi kesalahan saat mengupload media.' }, { quoted: message });
    }
  }
};