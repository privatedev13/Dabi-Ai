const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'addtoko',
  command: ['addtoko'],
  tags: 'Shop Menu',
  desc: 'Menambahkan toko',
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
      return conn.sendMessage(chatId, { text: "❌ Masukkan nama toko yang ingin ditambahkan!" }, { quoted: msg });
    }

    const tokoPath = './toolkit/set/toko.json';
    const pluginFolder = './plugins/Menu_Toko';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      console.error('Error membaca toko.json:', err);
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: msg });
    }

    if (!tokoData.storeSetting) tokoData.storeSetting = {};

    if (tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "⚠️ Toko sudah ada dalam daftar." }, { quoted: msg });
    }

    tokoData.storeSetting[tokoName] = [];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder, { recursive: true });

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    const tokoPluginCode = `
const fs = require('fs');

module.exports = {
  name: '${tokoName}',
  command: ['${tokoName}'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko ${tokoName}',

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: msg });
    }

    const items = tokoData.storeSetting['${tokoName}'];
    if (!items || items.length === 0) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: msg });
    }

    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

    const itemList = sortedItems.map((item, index) => \`\${side} \${btn} \${index + 1}. \${item.name}: \${item.price}\n\`).join('');
    
    conn.sendMessage(chatId, { 
      text: \`Selamat datang di toko ${tokoName}!\n\n\${head}\${Obrack} Daftar ${tokoName} \${Cbrack}\n\${itemList}\${foot}\`
    }, { quoted: msg });
  }
};`;

    fs.writeFileSync(tokoPluginPath, tokoPluginCode);

    await conn.sendMessage(chatId, { 
      text: `✅ Toko *"${tokoName}"* berhasil ditambahkan!\n📁 File toko dibuat di *plugins/Menu_Toko/${tokoName}.js*`
    }, { quoted: msg });

    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: msg });

    setTimeout(() => {
      process.exit(1);
    }, 3000);
  }
};