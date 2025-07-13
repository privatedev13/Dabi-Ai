module.exports = {
  name: 'intro',
  command: ['intro'],
  tags: 'Group Menu',
  desc: 'Mengirimkan intro grup',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, isGroup } = chatInfo;

      if (!isGroup) {
        return conn.sendMessage(chatId, {
          text: '⚠️ Perintah ini hanya dapat digunakan di grup.'
        }, { quoted: msg });
      }

      if (!enGcW(chatId)) {
        return conn.sendMessage(chatId, {
          text: '❌ Grup ini tidak terdaftar atau fitur welcome tidak aktif.'
        }, { quoted: msg });
      }

      const welcomeText = getWlcTxt(chatId);
      if (!welcomeText || welcomeText.trim() === '' || welcomeText.includes('Selamat datang @user')) {
        return conn.sendMessage(chatId, {
          text: '⚠️ Pesan welcome belum diatur.'
        }, { quoted: msg });
      }

      await conn.sendMessage(chatId, {
        text: welcomeText,
        contextInfo: {
          externalAdReply: {
            title: botFullName,
            body: 'Selamat Datang Member Baru',
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter'
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('Error di plugin intro.js:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: '⚠️ Terjadi kesalahan saat mengirim pesan intro!'
      }, { quoted: msg });
    }
  },
};