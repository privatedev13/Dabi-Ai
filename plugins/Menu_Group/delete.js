module.exports = {
  name: 'delete',
  command: ['d', 'del'],
  tags: 'Group Menu',
  desc: 'Menghapus pesan pengguna di group',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!isGroup) {
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });
      }

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const quotedSender = message.message?.extendedTextMessage?.contextInfo?.participant;
      if (!quotedMessage || !quotedKey || !quotedSender) {
        return conn.sendMessage(chatId, { text: "❌ Harap kutip pesan yang ingin dihapus!" }, { quoted: message });
      }

      const groupMetadata = await conn.groupMetadata(chatId);
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
      const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      const isQuotedFromBot = quotedSender === botNumber;

      if (!isQuotedFromBot && !isUserAdmin) {
        return conn.sendMessage(chatId, { text: "❌ Hanya admin grup yang bisa menghapus pesan pengguna lain!" }, { quoted: message });
      }

      if (!isBotAdmin) {
        return conn.sendMessage(chatId, { text: "❌ Bot harus menjadi admin untuk menghapus pesan!" }, { quoted: message });
      }

      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: isQuotedFromBot,
          id: quotedKey,
          ...(isQuotedFromBot ? {} : { participant: quotedSender })
        }
      });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: "⚠️ Gagal menghapus pesan." }, { quoted: message });
    }
  }
};