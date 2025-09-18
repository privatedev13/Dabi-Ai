import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { mediaMessage } from '../../toolkit/exif.js';

export default {
  name: 'toimg',
  command: ['toimg'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi gambar',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;

    try {
      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quotedMessage?.stickerMessage || msg.message?.stickerMessage;

      if (!sticker) {
        return conn.sendMessage(
          chatId,
          { text: '⚠️ Balas stiker atau kirim stiker dengan caption *toimg* untuk mengonversi!' },
          { quoted: msg }
        );
      }

      if (sticker.isAnimated) {
        return conn.sendMessage(chatId, { text: '❌ Stiker animasi tidak bisa dikonversi menjadi gambar.' }, { quoted: msg });
      }

      const tempDir = path.join(path.resolve(), 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const baseName = `${Date.now()}`;
      const webpPath = await mediaMessage({ message: quotedMessage || msg.message }, path.join(tempDir, baseName));
      const outputPath = `${webpPath}.png`;

      exec(`ffmpeg -i "${webpPath}" "${outputPath}"`, async (err) => {
        await fs.promises.unlink(webpPath).catch(() => {});
        if (err || !fs.existsSync(outputPath)) {
          return conn.sendMessage(chatId, { text: `❌ Konversi gagal: ${err?.message || 'Tidak diketahui'}` }, { quoted: msg });
        }

        const buffer = await fs.promises.readFile(outputPath);
        await conn.sendMessage(chatId, { image: buffer, caption: '🎉 Berhasil dikonversi!' }, { quoted: msg });
        await fs.promises.unlink(outputPath).catch(() => {});
      });

    } catch (error) {
      console.error('[ERROR] toimg:', error);
      return conn.sendMessage(chatId, { text: `❌ Gagal mengonversi: ${error.message}` }, { quoted: msg });
    }
  }
};