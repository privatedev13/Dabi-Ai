const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot (hanya untuk owner).',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    let mediaMessage;

    if (mtype === "imageMessage") {
      mediaMessage = message.message.imageMessage;
    } else if (mtype === "extendedTextMessage" && message.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage) {
      mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!mediaMessage) {
      return conn.sendMessage(chatId, { text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${isPrefix[0]}setpp\`` }, { quoted: message });
    }

    try {
      const stream = await downloadContentFromMessage(mediaMessage, "image");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await conn.updateProfilePicture(conn.user.id, buffer);
      conn.sendMessage(chatId, { text: "✅ Foto profil bot berhasil diperbarui!" }, { quoted: message });
    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat memperbarui foto profil bot." }, { quoted: message });
    }
  }
};