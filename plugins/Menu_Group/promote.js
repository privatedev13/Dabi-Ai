module.exports = {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  desc: 'Promosikan anggota menjadi admin grup',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!botAdmin) {
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
      const groupCache = new Map();
      groupCache.delete(chatId);
      await mtData(chatId, conn);
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