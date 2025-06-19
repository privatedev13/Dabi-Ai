module.exports = {
  name: 'getlinkgc',
  command: ['getlinkgc', 'getlinkgroup', 'linkgc', 'linkgroup'],
  tags: 'Group Menu',
  desc: 'Dapatkan tautan undangan grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!isGroup) {
        return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });
      }

      const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

      if (!userAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
      }

      if (!botAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: msg });
      }

      const groupInviteCode = await conn.groupInviteCode(chatId);
      const groupLink = `https://chat.whatsapp.com/${groupInviteCode}`;

      conn.sendMessage(chatId, { text: `🔗 Berikut adalah tautan undangan grup:\n${groupLink}` }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mendapatkan tautan grup.' }, { quoted: msg });
    }
  }
};