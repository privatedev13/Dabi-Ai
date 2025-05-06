module.exports = {
  name: 'demote',
  command: ['demote', 'stopadmin', 'demoteadmin'],
  tags: 'Group Menu',
  desc: 'Turunkan admin grup menjadi anggota',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const groupMetadata = await conn.groupMetadata(chatId);
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!isBotAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
    }

    const targetId = target(message, senderId);

    if (!targetId || targetId === senderId.replace(/@s\.whatsapp\.net$/, '')) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Harap mention atau reply admin yang ingin diturunkan!\nContoh: ${prefix}demote @user`,
        mentions: []
      }, { quoted: message });
    }

    const isTargetAdmin = groupMetadata.participants.some(p => p.id === `${targetId}@s.whatsapp.net` && p.admin);
    if (!isTargetAdmin) {
      return conn.sendMessage(chatId, {
        text: `❌ @${targetId} bukan admin grup!`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [`${targetId}@s.whatsapp.net`], 'demote');
      conn.sendMessage(chatId, {
        text: `✅ Berhasil menurunkan @${targetId} dari admin grup!`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, {
        text: '❌ Gagal menurunkan admin. Pastikan bot adalah admin dan ID yang dimaksud valid.'
      }, { quoted: message });
    }
  }
};