export default {
  name: 'promote',
  command: ['promote', 'jadiadmin', 'promoteadmin'],
  tags: 'Group Menu',
  desc: 'Promosikan anggota menjadi admin grup',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;

    if (!isGroup)
      return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup!' }, { quoted: msg });

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);

    if (!userAdmin)
      return conn.sendMessage(chatId, { text: 'Kamu bukan admin!' }, { quoted: msg });
    if (!botAdmin)
      return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

    const targetNum = target(msg, senderId);

    if (!targetNum || targetNum === senderId.replace(/\D/g, '')) {
      return conn.sendMessage(chatId, {
        text: `Harap mention atau reply anggota yang ingin dipromosikan!\nContoh: ${prefix}${commandText} @user`
      }, { quoted: msg });
    }

    const fullTargetId = `${targetNum}@s.whatsapp.net`;
    const metadata = await getMetadata(chatId, conn);

    if (!metadata)
      return conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg });

    const isAlreadyAdmin = metadata.participants.some(p =>
      p.phoneNumber?.replace(/@s\.whatsapp\.net$/, '') === targetNum &&
      (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (isAlreadyAdmin) {
      return conn.sendMessage(chatId, {
        text: `@${targetNum} sudah menjadi admin.`,
        mentions: [fullTargetId]
      }, { quoted: msg });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [fullTargetId], 'promote');
      if (!global.groupCache) global.groupCache = new Map();
      global.groupCache.delete(chatId);
      await getMetadata(chatId, conn);

      await conn.sendMessage(chatId, {
        text: `@${targetNum} sekarang adalah admin.`,
        mentions: [fullTargetId]
      }, { quoted: msg });
    } catch {
      conn.sendMessage(chatId, {
        text: 'Gagal mempromosikan anggota. Pastikan bot adalah admin dan ID valid.'
      }, { quoted: msg });
    }
  }
};