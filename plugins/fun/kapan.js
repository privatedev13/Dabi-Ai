export default {
  name: 'kapan',
  command: ['kapan yah', 'kapan'],
  tags: 'Fun Menu',
  desc: 'Sambung kata dengan bot',
  prefix: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    commandText,
    args
  }) => {
    try {
      const { when } = await global.loadFunctions();
      const { chatId, senderId, isGroup } = chatInfo;
      const kapan = when[Math.floor(Math.random() * when.length)];

      await conn.sendMessage(chatId, { text: kapan }, { quoted: msg });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
}