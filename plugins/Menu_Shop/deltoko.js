const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'deltoko',
  command: ['deltoko', 'deletetoko'],
  tags: 'Shop Menu',
  desc: 'Menghapus toko',
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
    if (!(await isOwner(module.exports, conn, msg))) return;

    const tokoName = args.join(' ').trim();
    if (!tokoName) {
      return conn.sendMessage(chatId, { text: "❌ Masukkan nama toko yang ingin dihapus!" }, { quoted: msg });
    }

    const tokoPath = './toolkit/set/toko.json';
    const pluginFolder = './plugins/Menu_Shop';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: msg });
    }

    if (!tokoData.storeSetting || !tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "⚠️ Toko tidak ditemukan dalam daftar." }, { quoted: msg });
    }

    delete tokoData.storeSetting[tokoName];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    if (fs.existsSync(tokoPluginPath)) {
      fs.unlinkSync(tokoPluginPath);
    }

    await conn.sendMessage(chatId, { 
      text: `✅ Toko *"${tokoName}"* berhasil dihapus!\n📁 File toko di *plugins/Menu_Shop/${tokoName}.js* juga dihapus.`
    }, { quoted: msg });

    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: msg });

    setTimeout(() => {
      process.exit(1);
    }, 3000);
  }
};