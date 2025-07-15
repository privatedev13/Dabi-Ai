const facebook = require("../../toolkit/scrape/facebook");

module.exports = {
  name: 'facebook',
  command: ['fb', 'fbdl', 'facebook'],
  tags: 'Download Menu',
  desc: 'Mendownload media dari Facebook',
  prefix: true,
  premium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🚨 *Format salah!*\nGunakan: *${prefix}${commandText} <url>*`
      }, { quoted: msg });
    }

    const url = args[0];

    if (!/^https?:\/\/(www\.)?facebook\.(com|watch)\/.+/.test(url)) {
      return conn.sendMessage(chatId, {
        text: `❌ *Masukkan URL Facebook yang valid!*`
      }, { quoted: msg });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: msg.key } });

      const videoData = await facebook(url);

      if (!videoData || !videoData.status || !videoData.video.length) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Gagal mengambil video! Pastikan link valid dan publik.*"
        }, { quoted: msg });
      }

      const bestVideo = videoData.video[0];

      const caption = `🎬 *Video Facebook Ditemukan!*\n\n📌 *Resolusi*: ${bestVideo.resolution || "Tidak diketahui"}\n📁 *Format*: ${bestVideo.format || "Tidak diketahui"}`;

      await conn.sendMessage(chatId, {
        caption,
        video: { url: bestVideo.url }
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "⚠️ *Terjadi kesalahan, coba lagi nanti!*"
      }, { quoted: msg });
    }
  },
};