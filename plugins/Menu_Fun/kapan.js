const { when } = require('../../toolkit/function.js');

module.exports = {
  name: 'kapan',
  command: ['kapan yah', 'kapan'],
  tags: 'Fun Menu',
  desc: '',

  run: async (conn, message, { text }) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = chatId.endsWith('@g.us')
        ? message.key.participant
        : chatId.replace(/:\d+@/, '@');

      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const prefix = module.exports.command.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const kapan = when[Math.floor(Math.random() * when.length)];

      await conn.sendMessage(chatId, { text: kapan }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}