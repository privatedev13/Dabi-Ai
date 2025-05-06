const { cekDosa } = require('../../toolkit/function.js');

module.exports = {
  name: 'Cek Dosa',
  command: ['cekdosa', 'cek dosa'],
  tags: 'Fun Menu',
  desc: 'Mengecek 10 dosa besar user',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      const targetId = target(message, senderId);
      const mentionTarget = targetId;

      const dosaUnik = [...cekDosa].sort(() => Math.random() - 0.5).slice(0, 10);

      let teks = `Top 10 dosa besar @${mentionTarget}\n`;
      dosaUnik.forEach((dosa, i) => {
        teks += `${i + 1}. ${dosa}\n`;
      });

      await conn.sendMessage(chatId, {
        text: teks.trim(),
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