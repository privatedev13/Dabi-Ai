const fs = require('fs');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'delbarang',
  command: ['delbarang', 'deleteitem', 'dropitem'],
  tags: 'Shop Menu',
  desc: 'Menghapus barang dari toko di toko.json',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    const tokoName = args.shift();
    const itemName = args.join(' ').trim();

    if (!tokoName || !itemName) {
      return conn.sendMessage(chatId, { text: '❌ Masukkan nama toko dan barang yang ingin dihapus!' }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca file toko.json' }, { quoted: message });
    }

    if (!tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: `❌ Toko *${tokoName}* tidak ditemukan!` }, { quoted: message });
    }

    const items = tokoData.storeSetting[tokoName];
    const itemIndex = items.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex === -1) {
      return conn.sendMessage(chatId, { text: `❌ Barang *${itemName}* tidak ditemukan di toko *${tokoName}*` }, { quoted: message });
    }

    items.splice(itemIndex, 1);
    tokoData.storeSetting[tokoName] = items;

    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    await conn.sendMessage(chatId, { text: `✅ Barang *${itemName}* berhasil dihapus dari toko *${tokoName}*` }, { quoted: message });
  }
};