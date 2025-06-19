const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: 'setpp',
  command: ['setpp', 'setprofile'],
  tags: 'Owner Menu',
  desc: 'Mengubah foto profil bot.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const mtype = Object.keys(msg.message || {})[0];
    let mediaMessage;

    if (mtype === "imageMessage") {
      mediaMessage = msg.message.imageMessage;
    } else if (mtype === "extendedTextMessage" &&
               msg.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage) {
      mediaMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!mediaMessage) {
      return conn.sendMessage(chatId, {
        text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar dengan caption atau reply gambar dengan perintah:\n\`${prefix}${commandText}\``
      }, { quoted: msg });
    }

    try {
      const stream = await downloadContentFromMessage(mediaMessage, "image");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await conn.updateProfilePicture(conn.user.id, buffer);
      conn.sendMessage(chatId, { text: "✅ Foto profil bot berhasil diperbarui!" }, { quoted: msg });
    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat memperbarui foto profil bot." }, { quoted: msg });
    }
  }
};