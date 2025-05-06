module.exports = {
  name: 'getlinkgc',
  command: ['getlinkgc', 'getlinkgroup', 'linkgc', 'linkgroup'],
  tags: 'Group Menu',
  desc: 'Dapatkan tautan undangan grup',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const groupMetadata = await conn.groupMetadata(chatId);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
    }

    try {
      const groupInviteCode = await conn.groupInviteCode(chatId);
      const groupLink = `https://chat.whatsapp.com/${groupInviteCode}`;

      conn.sendMessage(chatId, { text: `🔗 Berikut adalah tautan undangan grup:\n${groupLink}` }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mendapatkan tautan grup. Pastikan bot adalah admin dan grup memiliki tautan undangan.' }, { quoted: message });
    }
  }
};