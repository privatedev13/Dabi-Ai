const axios = require('axios');
const yts = require('yt-search');
const { downloadYoutubeAudio } = require('../../toolkit/scrape/ytplay');

async function getBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Error fetching buffer:', error);
    return null;
  }
}

const processedAudio = new Set();

module.exports = {
  name: 'play',
  command: ['play', 'lagu', 'song', 'ply'],
  tags: 'Download Menu',
  desc: 'Mendownload lagu dari YouTube',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isPrem(module.exports, conn, msg))) return;

      const text = args.join(" ");
      if (!text) {
        return conn.sendMessage(chatId, {
          text: `Masukkan judul lagu yang ingin dicari.\nContoh: *${prefix}${commandText} Jadian yuk chloe pawapua/<url>*`
        }, { quoted: msg });
      }

      if (processedAudio.has(text)) {
        return conn.sendMessage(chatId, {
          text: 'Masih ada proses yang belum selesai untuk lagu ini.'
        }, { quoted: msg });
      }
      processedAudio.add(text);

      const search = await yts(text);
      const video = search.videos[0];
      if (!video) {
        processedAudio.delete(text);
        return conn.sendMessage(chatId, { text: 'Video tidak ditemukan.' }, { quoted: msg });
      }

      const durationInSeconds = video.timestamp?.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
      if (durationInSeconds >= 3600) {
        processedAudio.delete(text);
        return conn.sendMessage(chatId, { text: 'Video berdurasi lebih dari 1 jam!' }, { quoted: msg });
      }

      const thumbnailBuffer = await getBuffer(video.thumbnail);

      let caption = `*Y O U T U B E - P L A Y*\n\n`;
      caption += `${head}\n`;
      caption += `${side} ${btn} Title : ${video.title || '-'}\n`;
      caption += `${side} ${btn} Duration : ${video.timestamp || '-'}\n`;
      caption += `${side} ${btn} Views : ${video.views || '-'}\n`;
      caption += `${side} ${btn} Upload : ${video.ago || '-'}\n`;
      caption += `${side} ${btn} Author : ${video.author?.name || '-'}\n`;
      caption += `${side} ${btn} URL : ${video.url}\n`;
      caption += `${foot}━━━━━━━━━━━━━━━━`;

      await conn.sendMessage(chatId, {
        image: thumbnailBuffer,
        caption: caption,
      }, { quoted: msg });

      const downloadUrl = await downloadYoutubeAudio(video.url);

      await conn.sendMessage(chatId, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      }, { quoted: msg });

      processedAudio.delete(text);

    } catch (error) {
      console.error('Error:', error);
      processedAudio.delete(text);
      return conn.sendMessage(msg.key.remoteJid, {
        text: `Terjadi kesalahan: ${error.message}`
      }, { quoted: msg });
    }
  }
};