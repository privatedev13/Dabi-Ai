const { cekKuat } = require('../../toolkit/function.js');

module.exports = {
  name: 'Cek kekuatan',
  command: ['cekkekuatan', 'cekkuat'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa kuat orang',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      let targetId = target(message, senderId);
      const mentionTarget = targetId;

      const cek = cekKuat[Math.floor(Math.random() * cekKuat.length)];

      const teks = `Nama: @${mentionTarget}\nKekuatan: ${cek}`

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}