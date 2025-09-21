export default {
  run: async (conn, msg, { chatInfo }, menuText) => {
    await conn.sendMessage(chatInfo.chatId, {
      text: menuText,
      contextInfo: {
        externalAdReply: {
          title: botFullName,
          body: `Anjan Menu ${botName}`,
          thumbnailUrl: thumbnail,
          mediaType: 2,
          renderLargerThumbnail: true,
        },
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: idCh
        }
      }
    }, { quoted: msg });
  }
};
