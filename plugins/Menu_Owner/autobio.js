module.exports = {
  name: 'autobio',
  command: ['autobio', 'bio'],
  tags: 'Owner Menu',
  desc: 'Mengatur autobio',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) {
      return conn.sendMessage(
        chatId,
        { text: 'Gunakan: .autobio on/off' },
        { quoted: message }
      );
    }

    const status = args[1].toLowerCase() === 'on';
    global.autoBio = status;

    conn.sendMessage(
      chatId,
      { text: `Auto Bio telah ${status ? 'diaktifkan' : 'dimatikan'}` },
      { quoted: message }
    );

    if (status) {
      global.updateBio(conn);
    }
  }
};