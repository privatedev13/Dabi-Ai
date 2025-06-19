const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: 'bratsticker',
  command: ['brat', 'bratvid'],
  tags: 'Tools Menu',
  desc: 'Membuat stiker brat',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!args.length) {
      return conn.sendMessage(chatId, { 
        text: `Masukkan teks untuk ${commandText === "bratvid" ? "Brat Video" : "Brat Sticker"}!` 
      }, { quoted: msg });
    }

    const isVideo = commandText === "bratvid";
    const baseUrl = isVideo 
      ? `${global.HamzWeb}/tools/bratvid`
      : `${global.HamzWeb}/tools/brat`;
    
    const bratUrl = `${baseUrl}?apikey=${global.HamzKey}&text=${encodeURIComponent(args.join(" "))}`;

    try {
      const response = await axios.get(bratUrl, { 
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": isVideo ? "video/mp4" : "image/png"
        }
      });

      if (!response.data) {
        return conn.sendMessage(chatId, { text: `Gagal mengambil ${isVideo ? "Brat Video" : "Brat Sticker"}. Coba lagi nanti.` }, { quoted: msg });
      }

      const inputExt = isVideo ? "mp4" : "png";
      const inputPath = path.join(__dirname, `../../temp/brat.${inputExt}`);
      const outputPath = path.join(__dirname, "../../temp/brat.webp");
      fs.writeFileSync(inputPath, response.data);

      const ffmpegCmd = isVideo
        ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -preset default -an -vsync 0 ${outputPath}`
        : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -lossless 1 ${outputPath}`;

      exec(ffmpegCmd, async (error) => {
        if (error) {
          console.error("Error converting to WebP:", error);
          return conn.sendMessage(chatId, { 
            text: `Gagal mengubah ${isVideo ? "video" : "gambar"} ke stiker.` 
          }, { quoted: msg });
        }

        const stickerBuffer = fs.readFileSync(outputPath);
        await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error(`Error fetching ${isVideo ? "Brat Video" : "Brat Sticker"}:`, error);
      await conn.sendMessage(chatId, { 
        text: `Gagal mengambil ${isVideo ? "Brat Video" : "Brat Sticker"}. Coba lagi nanti.` 
      }, { quoted: msg });
    }
  }
};