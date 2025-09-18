import fs from 'fs';
import path from 'path';

export default {
  name: 'addtoko',
  command: ['addtoko'],
  tags: 'Shop Menu',
  desc: 'Menambahkan toko',
  prefix: true,
  owner: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    const tokoName = args.join(' ').trim();

    if (!tokoName) {
      return conn.sendMessage(chatId, { text: "Masukkan nama toko yang ingin ditambahkan!" }, { quoted: msg });
    }

    const tokoPath = './toolkit/set/toko.json';
    const pluginFolder = './plugins/toko';

    let tokoData = {};
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      console.error('Gagal membaca toko.json:', err);
      return conn.sendMessage(chatId, { text: "Gagal membaca file toko.json" }, { quoted: msg });
    }

    tokoData.storeSetting ||= {};

    if (tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "Toko sudah ada dalam daftar." }, { quoted: msg });
    }

    tokoData.storeSetting[tokoName] = [];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder, { recursive: true });

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    const tokoPluginCode = `
import fs from 'fs';

export default {
  name: '${tokoName}',
  command: ['${tokoName}'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko ${tokoName}',

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const tokoPath = './toolkit/set/toko.json';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch {
      return conn.sendMessage(chatId, { text: "Gagal membaca file toko.json" }, { quoted: msg });
    }

    const items = tokoData.storeSetting['${tokoName}'];
    if (!items?.length) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: msg });
    }

    const itemList = items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item, i) => \`\${i + 1}. \${item.name}: \${item.price}\`)
      .join('\\n');

    conn.sendMessage(chatId, { 
      text: \`Daftar barang di toko ${tokoName}:\\n\\n\${itemList}\`
    }, { quoted: msg });
  }
};`;

    fs.writeFileSync(tokoPluginPath, tokoPluginCode.trim());

    const sentMsg = await conn.sendMessage(chatId, {
      text: `Toko "${tokoName}" berhasil ditambahkan.\nplugins/toko/${tokoName}.js`
    }, { quoted: msg });

    const editKey = sentMsg.key;

    await new Promise(resolve => setTimeout(resolve, 2000));
    await conn.sendMessage(chatId, {
      text: `Bot akan restart dalam 3 detik...`,
      edit: editKey
    }, { quoted: msg });

    setTimeout(() => process.exit(1), 3000);
  }
};