const { ytDonlodMp3, ytDonlodMp4 } = require('../../toolkit/scrape/youtube');

module.exports = {
  name: 'youtube',
  command: ['ytmp3', 'ytmp4'],
  tags: 'Download Menu',
  desc: 'Mendownload media dari YouTube',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      const text = args.join(' ').trim();
      if (!text) {
        return conn.sendMessage(chatId, {
          text: `Silakan masukkan link YouTube!\n\nContoh:\n${prefix}${commandText} https://youtube.com/watch?v=dQw4w9WgXcQ`
        }, { quoted: message });
      }

      const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      if (!regex.test(text)) {
        return conn.sendMessage(chatId, { text: `Link YouTube tidak valid.` }, { quoted: message });
      }

      await conn.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

      if (commandText === 'ytmp3') {
        const result = await ytDonlodMp3(text);
        await conn.sendMessage(chatId, {
          audio: { url: result.url },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: message });
      } else if (commandText === 'ytmp4') {
        const result = await ytDonlodMp4(text);
        await conn.sendMessage(chatId, {
          video: { url: result.url }
        }, { quoted: message });
      } else {
        await conn.sendMessage(chatId, { text: `Command tidak dikenali.` }, { quoted: message });
      }
    } catch (error) {
      console.error(error);
      await conn.sendMessage(message.key.remoteJid, { text: 'Aduh kak, error nih...' }, { quoted: message });
    }
  }
};