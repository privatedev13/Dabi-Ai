module.exports = {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  description: 'Promosikan anggota menjadi admin grup',

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
        text: `⚠️ Harap mention atau reply anggota yang ingin dipromosikan!\nContoh: ${prefix}${commandText} @user`,
        mentions: []
      }, { quoted: message });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [`${targetId}@s.whatsapp.net`], 'promote');
      conn.sendMessage(chatId, {
        text: `✅ Berhasil mempromosikan @${targetId} menjadi admin grup!`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, {
        text: '❌ Gagal mempromosikan anggota. Pastikan bot adalah admin dan ID yang dimaksud valid.'
      }, { quoted: message });
    }
  }
};