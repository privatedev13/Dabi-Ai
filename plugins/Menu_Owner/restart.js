const cleartemp = require('./cleartemp');

module.exports = {
  name: 'restart',
  command: ['restart', 'rt'],
  tags: 'Owner Menu',
  desc: 'Merestart bot',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    await cleartemp.run(conn, message, { isPrefix });

    await conn.sendMessage(chatId, { text: "🔄 Membersihkan folder temp selesai. Bot akan restart dalam 2 detik..." }, { quoted: message });

    await new Promise(resolve => setTimeout(resolve, 2000));

    process.exit(1);
  }
};