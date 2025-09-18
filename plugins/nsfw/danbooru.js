import { danbooru } from '../../toolkit/scrape/danbooru.js';

export default {
  name: 'donbooru',
  command: ['donbooru', 'db'],
  tags: 'Nsfw Menu',
  desc: 'Cari gambar dari Danbooru',
  prefix: true,
  premium: true,

  run: async (conn, msg, {
    args,
    chatInfo
  }) => {
    const { chatId } = chatInfo;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan query! Contoh: *.donbooru rem*' }, { quoted: msg });
    }

    try {
      const query = args.join(' ');
      const result = await danbooru(query, '18+');

      await conn.sendMessage(chatId, {
        image: { url: result.full_file_url },
        caption: `✨ *Hasil Danbooru*
📌 Tags: ${result.tags || '-'}
🔗 Source: ${result.source || '-'}
🆔 ID: ${result.id}`
      }, { quoted: msg });

    } catch (err) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
  }
};