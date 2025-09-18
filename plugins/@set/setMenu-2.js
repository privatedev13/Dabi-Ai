import axios from 'axios';

export default {
  run: async (conn, msg, { chatInfo }, menuText) => {
    const downloadImage = async (url) => {
      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(res.data, "binary");
      } catch {
        return null;
      }
    };
    const thumbnailBuffer = await downloadImage(thumbnail);

      const documentMessage = {
        document: { url: thumbnail },
        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        fileName: "≡ 𝐌𝐄𝐍𝐔",
        fileLength: 1,
        jpegThumbnail: thumbnailBuffer,
        caption: menuText,
        footer: footer,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            body: `Ini Menu ${botFullName}`,
            thumbnailUrl: thumbnail,
            thumbnail: thumbnailBuffer,
            mediaType: 1,
            renderLargerThumbnail: true,
            mediaUrl: chShort,
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh,
            newsletterName: footer,
          },
        },
      };

    await conn.sendMessage(chatInfo.chatId, documentMessage, { quoted: msg });
  }
};