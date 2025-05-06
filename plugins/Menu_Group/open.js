const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'open',
  command: ['open', 'buka', 'bukagrup'],
  tags: 'Group Menu',
  desc: 'Membuka chat Group',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    try {
      const groupMetadata = await conn.groupMetadata(chatId);
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
      const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      if (!isUserAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
      }

      if (!isBotAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Bot harus menjadi admin untuk membuka grup!' }, { quoted: message });
      }

      await conn.groupSettingUpdate(chatId, 'not_announcement');
      conn.sendMessage(chatId, { text: '🔓 Grup telah dibuka! Sekarang semua anggota bisa mengirim pesan.' }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal membuka grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};