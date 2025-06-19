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

    if (!/facebook\.\w+\/(reel|watch|share)/gi.test(url)) {
      return conn.sendMessage(chatId, {
        text: `❌ *Masukkan URL Facebook yang valid!*`
      }, { quoted: msg });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: msg.key } });

      const videoData = await facebook(url);

      if (!videoData || !videoData.video.length) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Gagal mengambil video! Pastikan link valid dan publik.*"
        }, { quoted: msg });
      }

      const bestQualityVideo = videoData.video[0]?.url;
      if (!bestQualityVideo) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Video tidak ditemukan atau tidak dapat diunduh!*"
        }, { quoted: msg });
      }

      const caption = `🎬 *Video Facebook Ditemukan!*\n\n📌 *Judul*: ${videoData.title || "Tidak diketahui"}\n⏳ *Durasi*: ${videoData.duration || "Tidak diketahui"}`;

      await conn.sendMessage(chatId, {
        image: { url: videoData.thumbnail },
        caption,
      }, { quoted: msg });

      await conn.sendMessage(chatId, {
        video: { url: bestQualityVideo },
        caption: "✅ *Berikut videonya!*"
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "⚠️ *Terjadi kesalahan, coba lagi nanti!*"
      }, { quoted: msg });
    }
  },
};