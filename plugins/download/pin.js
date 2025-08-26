const { pinterestSearch } = require('../../toolkit/scrape/pin.js');

module.exports = {
  name: 'Pinterest',
  command: ['pin', 'pinterest'],
  tags: 'Downloader',
  desc: 'Cari gambar dari Pinterest',
  prefix: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    try {
      if (!args[0]) {
        return conn.sendMessage(chatId, { text: "Masukkan kata kunci pencarian" }, { quoted: msg });
      }

      const results = await pinterestSearch(args.join(" "));
      if (!results.length) {
        return conn.sendMessage(chatId, { text: "Tidak ada hasil ditemukan." }, { quoted: msg });
      }

      for (const r of results) {
        await conn.sendMessage(chatId, {
          image: { url: r.url },
          caption: `📌 *${r.title}*\n🔗 Pin: ${r.pin}`
        }, { quoted: msg });
      }
    } catch (e) {
      conn.sendMessage(chatId, { text: "Terjadi kesalahan." }, { quoted: msg });
      console.error(e);
    }
  }
};