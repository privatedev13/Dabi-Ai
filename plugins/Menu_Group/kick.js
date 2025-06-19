module.exports = {
  name: 'kick',
  command: ['kick', 'dor', 'tendang', 'keluar'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan anggota dari grup.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    let targetId = target(msg, senderId);
    const mentionTarget = targetId;

    const teks = `❌ Gunakan format:\n${prefix}${commandText} @${mentionTarget} atau reply pesan target.`;
    const teks1 = `✅ Berhasil mengeluarkan @${mentionTarget}`;

    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: msg });

    const { botAdmin, userAdmin, adminList } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: msg });
    }

    if (!botAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: msg });
    }

    let mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetUser = mentionedJid[0] || (quotedMessage ? msg.message.extendedTextMessage.contextInfo.participant : null);

    if (!targetUser) return conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: msg });

    if (adminList.includes(targetUser)) {
      return conn.sendMessage(chatId, { text: "❌ Tidak bisa mengeluarkan admin grup!" }, { quoted: msg });
    }

    await conn.groupParticipantsUpdate(chatId, [targetUser], "remove")
      .then(() => conn.sendMessage(chatId, {
        text: teks1,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg }))
      .catch(() => conn.sendMessage(chatId, { text: "❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin!" }, { quoted: msg }));
  }
};