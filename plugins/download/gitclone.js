import fetch from 'node-fetch';

export default {
  name: 'gitclone',
  command: ['git', 'gitclone'],
  tags: 'Download Menu',
  desc: 'Download repository GitHub dalam bentuk .zip',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    const url = args.join(' ');
    if (!url) return conn.sendMessage(chatId, { text: `Where is the link?\nExample:\n${prefix}${commandText} https://github.com/anjanai` }, { quoted: msg });
    if (!/^https?:\/\/.*github\.com/.test(url)) return conn.sendMessage(chatId, { text: `Link invalid!!` }, { quoted: msg });

    await conn.sendMessage(chatId, { react: { text: '📦', key: msg.key } });

    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/);
      if (!match) return conn.sendMessage(chatId, { text: 'Invalid GitHub link.' }, { quoted: msg });

      const [_, user, repoRaw] = match;
      const repo = repoRaw.replace(/.git$/, '');
      const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball`;
      const head = await fetch(zipUrl, { method: 'HEAD' });
      const fileName = head.headers.get('content-disposition')?.match(/filename=(.*)/)?.[1];

      if (!fileName) return conn.sendMessage(chatId, { text: 'Failed to get file info.' }, { quoted: msg });

      await conn.sendMessage(chatId, {
        document: { url: zipUrl },
        fileName: fileName + '.zip',
        mimetype: 'application/zip'
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mendownload repository.' }, { quoted: msg });
    }
  }
};
