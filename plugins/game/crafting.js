const fs = require('fs');
const path = require('path');
const gameFile = path.join(__dirname, '../../toolkit/db/game.json');

module.exports = {
  name: 'crafting',
  command: ['crafting', 'buat'],
  tags: 'Game Menu',
  desc: 'Membuat item dari bahan',
  prefix: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const { rsc } = await global.loadFunc();
      const db = JSON.parse(fs.readFileSync(gameFile));
      const users = db.tca?.user || {};
      const nama = Object.keys(users).find(k => users[k].id === senderId);

      console.log('[DEBUG] Sender ID:', senderId);
      console.log('[DEBUG] Nama pengguna ditemukan:', nama);

      if (!nama) {
        return conn.sendMessage(chatId, {
          text: `Kamu belum mempunyai akun game!\nKetik *.create <nama>* untuk membuat akun.`
        }, { quoted: msg });
      }

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `Format salah!\nContoh: *.buat pickaxe iron*`
        }, { quoted: msg });
      }

      const u = users[nama];
      const inv = u.inv = u.inv || {};
      const [tool, mat] = args;
      const bahan = mat.toLowerCase();
      const kayu = 'wood';

      console.log('[DEBUG] Tool:', tool);
      console.log('[DEBUG] Material:', bahan);
      console.log('[DEBUG] Inventory saat ini:', inv);

      const m = rsc.mat.find(([_, n]) => n === bahan);
      console.log('[DEBUG] Data material ditemukan:', m);

      if (!m) {
        return conn.sendMessage(chatId, {
          text: `Material *${bahan}* tidak dikenali.`
        }, { quoted: msg });
      }

      if ((inv[bahan] || 0) < 1 || (inv[kayu] || 0) < 1) {
        return conn.sendMessage(chatId, {
          text: `Bahan tidak cukup!\nDibutuhkan: 1 ${bahan} & 1 ${kayu}`
        }, { quoted: msg });
      }

      // Kurangi bahan
      if (--inv[bahan] === 0) delete inv[bahan];
      if (--inv[kayu] === 0) delete inv[kayu];

      // Tambahkan item hasil crafting
      inv[tool] = inv[tool] || {};
      inv[tool][bahan] = { durabilty: m[2] || 1000 };

      console.log('[DEBUG] Item baru ditambahkan:', inv[tool][bahan]);

      // Simpan ke file
      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2));
      console.log('[DEBUG] Data game berhasil disimpan.');

      conn.sendMessage(chatId, {
        text: `✅ Berhasil membuat *${tool}.${bahan}* dengan durabilitas ${m[2] || 1000}.\nBahan telah dikurangi.`
      }, { quoted: msg });

    } catch (err) {
      console.error('[ERROR] Terjadi kesalahan saat crafting:', err);
      conn.sendMessage(chatId, {
        text: '❌ Terjadi kesalahan saat crafting!'
      }, { quoted: msg });
    }
  }
};