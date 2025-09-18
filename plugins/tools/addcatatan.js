import fs from "fs";
import path from "path";
const __dirname = getDirname(import.meta.url);
const catatanPath = path.join(__dirname, "../../toolkit/db/catatan.json");

export default {
  name: "addcatat",
  command: ["addcatat", "addcatatan"],
  tags: "Tools Menu",
  desc: "Tambah nama catatan",
  prefix: true,
  owner: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId } = chatInfo;

    try {
      if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, "{}");

      const catatan = JSON.parse(fs.readFileSync(catatanPath));
      const nama = args[0];

      if (!nama)
        return conn.sendMessage(chatId, { text: `Contoh: ${prefix}addcatat NamaCatatan` }, { quoted: msg });

      if (catatan[nama])
        return conn.sendMessage(chatId, { text: `Catatan *${nama}* sudah ada.` }, { quoted: msg });

      catatan[nama] = {};
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));

      return conn.sendMessage(chatId, { text: `Berhasil membuat catatan *${nama}*.` }, { quoted: msg });

    } catch (err) {
      console.error("Error addcatat:", err);
      return conn.sendMessage(chatId, { text: `Error: ${err.message}` }, { quoted: msg });
    }
  }
};