import fs from 'fs';
import path from 'path';

export default {
  name: 'settoko',
  command: ['settoko'],
  tags: 'Shop Menu',
  desc: 'Mengatur atau menulis barang',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    const tokoName = args.shift();
    const itemName = args.shift();
    const itemPrice = args.shift();

    if (!tokoName || !itemName || !itemPrice) {
      return conn.sendMessage(chatId, { text: "❌ Format: settoko <nama_toko> <nama_barang> <harga>" }, { quoted: msg });
    }

    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file tokoon" }, { quoted: msg });
    }

    if (!tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "❌ Toko tidak ditemukan" }, { quoted: msg });
    }

    tokoData.storeSetting[tokoName].push({ name: itemName, price: itemPrice });
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    await conn.sendMessage(chatId, { 
      text: `✅ Barang *"${itemName}"* dengan harga *${itemPrice}* berhasil ditambahkan ke toko *"${tokoName}"*!`
    }, { quoted: msg });
  }
};