module.exports = {
  name: 'hidetag',
  command: ['hidetag', 'h'],
  tags: 'Group Menu',
  desc: 'Kirim pesan ke semua anggota grup tanpa menyebut mereka',

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

    const textToSend = args.join(' ');
    if (!textToSend) {
      return conn.sendMessage(chatId, { text: `⚠️ Harap masukkan teks yang ingin dikirim!\nContoh: ${prefix}hidetag Pesan rahasia` }, { quoted: message });
    }

    try {
      await conn.sendMessage(chatId, {
        text: textToSend,
        mentions: groupMetadata.participants.map(p => p.id)
      }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengirim pesan.' }, { quoted: message });
    }
  }
};