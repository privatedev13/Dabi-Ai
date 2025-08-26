const fs = require('fs');
const path = require('path');
const gameFile = path.join(__dirname, '../../toolkit/db/game.json');

module.exports = {
  name: 'crafting',
  command: ['crafting', 'buat'],
  tags: 'Rpg Menu',
  desc: 'Membuat item dari bahan',
  prefix: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const { ore } = await global.loadFunc();
      const db = JSON.parse(fs.readFileSync(gameFile));
      const users = db.tca?.user || {};
      const nama = Object.keys(users).find(k => users[k].id === senderId);

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

      const dataMat = ore.mat.find(([_, n]) => n === bahan);
      if (!dataMat) {
        return conn.sendMessage(chatId, {
          text: `Material ${bahan} tidak dikenali.`
        }, { quoted: msg });
      }

      const durability = dataMat[2] || 1000;
      const kayuKey = 'wood';
      const oreKey = 'ore';

      const kayuAda = Object.values(inv.wood || {}).reduce((a, b) => a + b, 0) > 0;
      const bahanAda = (inv.ore?.[bahan] || 0) > 0;

      if (!kayuAda || !bahanAda) {
        return conn.sendMessage(chatId, {
          text: `Bahan tidak cukup!\nDibutuhkan: 1 ${bahan} (ore) & 1 kayu`
        }, { quoted: msg });
      }

      inv.ore[bahan]--;
      if (inv.ore[bahan] === 0) delete inv.ore[bahan];

      const woodTypes = Object.keys(inv.wood || {});
      if (woodTypes.length) {
        const w = woodTypes[0];
        inv.wood[w]--;
        if (inv.wood[w] === 0) delete inv.wood[w];
      }

      inv[tool] = inv[tool] || {};
      inv[tool][bahan] = { durabilty: durability };

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `Berhasil membuat ${tool}.${bahan} dengan durabilitas ${durability}.\nBahan telah dikurangi.`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat crafting!'
      }, { quoted: msg });
    }
  }
};