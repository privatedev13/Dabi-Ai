const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'open',
  command: ['open', 'buka', 'bukagrup'],
  tags: 'Group Menu',
  desc: 'Membuka chat Group',
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

      await conn.groupSettingUpdate(chatId, 'not_announcement');
      conn.sendMessage(chatId, { text: '🔓 Grup telah dibuka! Sekarang semua anggota bisa mengirim pesan.' }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal membuka grup. Coba lagi nanti.' }, { quoted: msg });
    }
  }
};