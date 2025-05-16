const { uploadToCatbox } = require("../../toolkit/scrape/uploader");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: 'toimg',
  command: ['toimg'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi gambar',
  prefix: true,
  isPremium: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isPrem(module.exports, conn, message))) return;

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMessage?.stickerMessage || message.message?.stickerMessage;

      if (!stickerMessage) {
        return conn.sendMessage(chatId, { text: "⚠️ Harap balas atau kutip stiker untuk dikonversi ke gambar!" }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(stickerMessage, "sticker");
      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) throw new Error("Gagal mengunduh stiker!");

      const tempDir = path.join(__dirname, "../../temp");
      await fs.mkdir(tempDir, { recursive: true });

      const tempFile = path.join(tempDir, "sticker.webp");
      await fs.writeFile(tempFile, buffer);

      const imageUrl = await uploadToCatbox(tempFile);
      await fs.unlink(tempFile).catch(() => {});

      if (!imageUrl) throw new Error("Gagal mengunggah gambar ke Catbox!");

      return conn.sendMessage(chatId, { image: { url: imageUrl }, caption: "🎉 Stiker berhasil dikonversi ke gambar!" }, { quoted: message });

    } catch (error) {
      return conn.sendMessage(message.key.remoteJid, { text: `❌ Gagal mengonversi stiker: ${error.message}` }, { quoted: message });
    }
  }
};