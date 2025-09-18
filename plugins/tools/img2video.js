import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { img2video } from "../../toolkit/scrape/img2vid.js";

export default {
  name: "img2video",
  command: ["img2video", "i2v"],
  tags: "Tools Menu",
  desc: "Ubah gambar jadi video pakai Luma AI",
  prefix: true,
  owner: false,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;

    if (!imageMessage) {
      return conn.sendMessage(
        chatId,
        {
          text: "❌ Harap balas gambar dengan caption *i2v* / *img2video* atau kirim langsung gambar dengan caption yang sama.",
        },
        { quoted: msg }
      );
    }

    try {
      const media = await downloadMediaMessage(
        { message: { imageMessage } },
        "buffer"
      );

      if (!media) throw new Error("Gagal mengunduh gambar!");

      const result = await img2video(media, termaiWeb, termaiKey);

      if (result?.status === "completed" && result?.video?.url) {
        await conn.sendMessage(
          chatId,
          {
            video: { url: result.video.url },
            caption: "✅ Berhasil convert gambar ke video!",
          },
          { quoted: msg }
        );
      } else {
        await conn.sendMessage(
          chatId,
          { text: "❌ Gagal generate video, coba lagi." },
          { quoted: msg }
        );
      }
    } catch (err) {
      await conn.sendMessage(
        chatId,
        { text: `❌ Error: ${err.message}` },
        { quoted: msg }
      );
    }
  },
};