module.exports = {
  name: 'listgroup',
  command: ['listgc', 'listgroup'],
  tags: 'Info Menu',
  desc: 'Melihat semua grup yang bot masuki (Hanya untuk pengguna premium)',

  isPremium: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyPremium(module.exports, conn, message))) return;

    try {
      const groups = await conn.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (groupList.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Bot tidak tergabung dalam grup mana pun.' }, { quoted: message });
      }

      let response = `📋 *Daftar Grup yang Bot Ikuti:*\n\n`;
      groupList.forEach((group, index) => {
        response += `${index + 1}. *${group.subject}*\n   📌 ID: ${group.id}\n   👥 Member: ${group.size}\n\n`;
      });

      conn.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengambil daftar grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};