import fs from 'fs';
import path from 'path';

const tokoPath = './toolkit/set/toko.json';
const pluginFolder = './plugins/toko';

export default {
  name: 'deltoko',
  command: ['deltoko', 'deletetoko'],
  tags: 'Shop Menu',
  desc: 'Menghapus toko',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const tokoName = args.join(' ').trim();
    if (!tokoName) {
      return conn.sendMessage(chatId, { text: "Masukkan nama toko yang ingin dihapus!" }, { quoted: msg });
    }

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      console.error('Gagal membaca toko.json:', err);
      return conn.sendMessage(chatId, { text: "Gagal membaca file toko.json" }, { quoted: msg });
    }

    if (!tokoData.storeSetting?.[tokoName]) {
      return conn.sendMessage(chatId, { text: "Toko tidak ditemukan dalam daftar." }, { quoted: msg });
    }

    delete tokoData.storeSetting[tokoName];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    if (fs.existsSync(tokoPluginPath)) fs.unlinkSync(tokoPluginPath);

    const sentMsg = await conn.sendMessage(chatId, {
      text: `Toko "${tokoName}" berhasil dihapus.\nplugins/toko/${tokoName}.js`
    }, { quoted: msg });

    await new Promise(res => setTimeout(res, 2000));
    await conn.sendMessage(chatId, {
      text: "Bot akan restart dalam 3 detik...",
      edit: sentMsg.key
    }, { quoted: msg });

    setTimeout(() => process.exit(1), 3000);
  }
};