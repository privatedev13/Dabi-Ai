import fs from 'fs/promises';
import { existsSync, writeFileSync } from 'fs';
import '../../toolkit/setting.js';

const tokoPath = './toolkit/set/toko.json';
const dbPath = './toolkit/db/datatoko.json';

export default {
  name: 'Buy',
  command: ['beli', 'buy'],
  tags: 'Shop Menu',
  desc: 'Membeli barang dari toko',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo;

    if (!existsSync(dbPath)) {
      writeFileSync(dbPath, JSON.stringify({ pendingOrders: [] }, null, 2));
    }
    const dbData = JSON.parse(await fs.readFile(dbPath, 'utf-8'));
    dbData.pendingOrders = dbData.pendingOrders || [];

    if (args.length < 2) {
      return conn.sendMessage(
        chatId,
        { text: `Gunakan format *${prefix}${commandText} <Toko> <Barang>*` },
        { quoted: msg }
      );
    }

    const tokoName = args[0];
    const barangName = args.slice(1).join(' ');
    const tokoData = JSON.parse(await fs.readFile(tokoPath, 'utf-8'));

    if (!tokoData.storeSetting?.[tokoName]) {
      return conn.sendMessage(
        chatId,
        { text: `Toko "${tokoName}" tidak ditemukan.` },
        { quoted: msg }
      );
    }

    const barang = tokoData.storeSetting[tokoName]
      .find(i => i.name.toLowerCase() === barangName.toLowerCase());

    if (!barang) {
      return conn.sendMessage(
        chatId,
        { text: `Barang "${barangName}" tidak ditemukan di toko "${tokoName}".` },
        { quoted: msg }
      );
    }

    const pay = global.ownerStore;
    const bayar = `Metode Pembayaran:\n- Dana: ${pay.dana}\n- GoPay: ${pay.gopay}\n- OVO: ${pay.ovo}`;
    const caption = `Pembelian Pending\n\nUser: @${senderId.split('@')[0]}\nToko: ${tokoName}\nBarang: ${barang.name}\nHarga: Rp${barang.price.toLocaleString()}\n\n${bayar}\n\nOwner reply "done" untuk konfirmasi.`;

    const sent = await conn.sendMessage(
      chatId,
      {
        image: { url: "https://files.catbox.moe/4cuj4g.jpeg" },
        caption,
        mentions: [senderId]
      },
      { quoted: msg }
    );

    dbData.pendingOrders.push({
      userId: senderId,
      idChat: sent.key.id,
      toko: tokoName,
      barang: barang.name,
      harga: barang.price
    });

    await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2));
  }
};