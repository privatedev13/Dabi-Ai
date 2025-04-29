const { ask } = require('../../toolkit/function.js');

module.exports = {
  name: 'Tanya jawab',
  command: ['apakah', 'Apakah', 'Bukan kah', 'Bukankah', 'Benarkah', 'Benar kah', 'bukan kah', 'bukankah', 'benarkah', 'benar kah'],
  tags: 'Fun Menu',
  desc: 'Bertanya ke pada bot',

  run: async (conn, message) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = chatId.endsWith('@g.us')
        ? message.key.participant
        : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      const prefix = module.exports.command.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const tanya = ask[Math.floor(Math.random() * ask.length)];

      await conn.sendMessage(chatId, { text: tanya }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}