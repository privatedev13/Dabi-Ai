module.exports = {
  name: 'add',
  command: ['add', 'invite', 'tambahkan'],
  tags: 'Group Menu',
  desc: 'Menambahkan anggota ke grup (hanya bisa digunakan oleh admin).',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    let targetId = target(message, senderId);
    const mentionTarget = targetId;

    if (!isGroup)
      return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" });

    const groupMetadata = await conn.groupMetadata(chatId);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin)

    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
    }

    if (!isBotAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot harus menjadi admin untuk menambahkan orang ke grup!' }, { quoted: message });
    }

    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedSender = message.message?.extendedTextMessage?.contextInfo?.participant;

    let targetUser = quotedSender;

    if (!targetUser && args[1]) {
      const number = args[1].replace(/[^0-9]/g, "");
      if (number.length < 8) {
        return conn.sendMessage(chatId, { text: "❌ Nomor tidak valid!" }, { quoted: message });
      }
      targetUser = number + "@s.whatsapp.net";
    }

    if (!targetUser) {
      return conn.sendMessage(chatId, {
        text: `❌ Gunakan perintah ini dengan format:\n• Reply pesan target\n• ${prefix}add 628xxxxxxxxx`
      }, { quoted: message });
    }

    const alreadyInGroup = groupMetadata.participants.some(p => p.id === targetUser);
    if (alreadyInGroup) {
      return conn.sendMessage(chatId, { text: "✅ Target sudah berada dalam grup." }, { quoted: message });
    }

    await conn.groupParticipantsUpdate(chatId, [targetUser], "add")
      .then(() => conn.sendMessage(chatId, {
        text: `✅ Berhasil menambahkan @${mentionTarget}`,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message }))
      .catch(() => conn.sendMessage(chatId, {
        text: "❌ Gagal menambahkan anggota. Pastikan nomor aktif dan bot adalah admin!"
      }, { quoted: message }));
  }
};