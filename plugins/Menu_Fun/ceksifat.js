const { sifatlist } = require('../../toolkit/function.js');

module.exports = {
  name: 'ceksifat',
  command: ['ceksifat'],
  tags: 'Fun Menu',
  desc: 'Menebak sifat seseorang berdasarkan nama secara acak.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      let targetId = senderId;
      let mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      let quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

      if (mentionedJid) {
        targetId = mentionedJid;
      } else if (quotedParticipant) {
        targetId = quotedParticipant;
      }

      const username = targetId.split('@')[0];
      const sifat = sifatlist[Math.floor(Math.random() * sifatlist.length)];

      await conn.sendMessage(chatId, {
        text: `Nama: @${username}\nSifat: ${sifat}`,
        mentions: [targetId]
      }, { quoted: message });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};