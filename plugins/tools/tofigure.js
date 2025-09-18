import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { uploadImage, startJob, checkStatus } from "../../toolkit/scrape/tofigur.js";

export default {
  name: "tofigure",
  command: ["tofigur", "tofigure"],
  tags: "Tools Menu",
  desc: "Ubah gambar jadi figurine 3D realistis",
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    try {
      const imageMessage = msg.quoted?.mimetype?.includes("image")
        ? msg.quoted
        : msg.message?.imageMessage;

      if (!imageMessage) {
        return conn.sendMessage(chatId, { text: "Harus mengirim atau reply gambar" }, { quoted: msg });
      }

      const prompt = `Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.`;

      await conn.sendMessage(chatId, { text: "Sedang memproses gambar..." }, { quoted: msg });

      let stream = await downloadContentFromMessage(imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const imageUrl = await uploadImage(buffer);
      const taskId = await startJob(prompt, imageUrl, "FanzOffc");

      if (!taskId) {
        return conn.sendMessage(chatId, { text: "Gagal memulai job" }, { quoted: msg });
      }

      const result = await checkStatus(taskId, "FanzOffc");
      if (result) {
        await conn.sendMessage(chatId, { image: result, caption: "Hasil edit selesai" }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, { text: "Task masih diproses, coba cek lagi nanti" }, { quoted: msg });
      }
    } catch (e) {
      await conn.sendMessage(chatId, { text: "Terjadi error: " + e.message }, { quoted: msg });
    }
  },
};