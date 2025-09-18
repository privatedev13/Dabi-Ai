import meFire from '../../toolkit/scrape/mediafire.js';

export default {
  name: 'MediaFire',
  command: ['md', 'mediafire'],
  tags: 'Download Menu',
  desc: 'Download file mediafire',
  prefix: true,
  premium: true,
  owner: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!args[0]) return conn.sendMessage(chatId, { text: `Contoh:\n${prefix + commandText} https://www.mediafire.com/file/xxxxx` }, { quoted: msg });

      const { name, size, mime, url } = await meFire(args[0]);
      const caption = `*MediaFire Downloader*\n*Nama:* ${name}\n*Ukuran:* ${size}\n*MIME:* ${mime}\nSedang mengirim file...`;

      await conn.sendMessage(chatId, { text: caption }, { quoted: msg });
      await conn.sendMessage(chatId, {
        document: { url },
        fileName: name,
        mimetype: mime
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      conn.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan. Coba lagi nanti!' }, { quoted: msg });
    }
  }
}