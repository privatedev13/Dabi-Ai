import fs from 'fs';

export default {
  name: 'panel',
  command: ['panel'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko panel',

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const tokoPath = './toolkit/set/toko.json';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch {
      return conn.sendMessage(chatId, { text: "Gagal membaca file toko.json" }, { quoted: msg });
    }

    const items = tokoData.storeSetting['panel'];
    if (!items?.length) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: msg });
    }

    const itemList = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item, i) => `${i + 1}. ${item.name}: ${item.price}`)
      .join('\n');

    conn.sendMessage(chatId, { 
      text: `Daftar barang di toko panel:\n\n${itemList}`
    }, { quoted: msg });
  }
};