const fs = require('fs');
const path = require('path');
const gameFile = path.join(__dirname, '../../toolkit/db/game.json');

module.exports = {
  name: 'maining',
  command: ['maining'],
  tags: 'Game Menu',
  desc: 'Menambang untuk mendapatkan item dan XP',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const { rsc } = await global.loadFunc();
      const db = JSON.parse(fs.readFileSync(gameFile));
      const user = Object.values(db.tca?.user || {}).find(v => v.id === senderId);

      if (!user) {
        return conn.sendMessage(chatId, {
          text: '❌ Kamu belum memiliki akun game!\nKetik *.create <nama>* untuk membuat akun.'
        }, { quoted: msg });
      }

      const inv = user.inv || {};
      const pick = inv.pickaxe || {};
      const pkey = Object.keys(pick)[0];
      const pval = pick[pkey];

      if (!pkey) {
        return conn.sendMessage(chatId, {
          text: '🪓 Kamu tidak memiliki *Pickaxe*!\nSilakan beli atau buat terlebih dahulu.'
        }, { quoted: msg });
      }

      if (!pval || typeof pval.durabilty !== 'number') {
        return conn.sendMessage(chatId, {
          text: `🔧 Pickaxe *${pkey}* tidak valid atau rusak.`
        }, { quoted: msg });
      }

      const [emo, item] = rsc.mat[Math.floor(Math.random() * rsc.mat.length)];
      const amt = Math.floor(Math.random() * 121) + 10;
      const loss = Math.ceil(amt / 20);
      const xp = Math.min(amt / 100, 1);

      inv[item] = (inv[item] || 0) + amt;
      pval.durabilty -= loss;
      if (pval.durabilty <= 0) delete pick[pkey];

      user.lvl = Number(((user.lvl || 0) + xp).toFixed(2));
      user.maining = `${amt}x ${item}`;

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2));

      const txt = `🪓 *Menambang berhasil!*\n\n📦 Hasil Tambang: ${emo} ${item} x${amt}\n🎚️ XP Tambahan: +${xp.toFixed(2)}\n🔧 Durabilitas ${pkey}: ${pval?.durabilty ?? 0}`;
      conn.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, {
        text: '❌ Terjadi kesalahan saat menambang!'
      }, { quoted: msg });
    }
  }
};