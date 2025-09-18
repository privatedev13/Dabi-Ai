import fs from 'fs';
import path from 'path';
const gameFile = path.resolve('./toolkit/db/game.json');

export default {
  name: 'tebang',
  command: ['tebang', 'tebangpohon'],
  tags: 'Rpg Menu',
  desc: 'Menebang pohon untuk mendapatkan kayu dan XP',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const wood = global.wood;
      const db = JSON.parse(fs.readFileSync(gameFile));
      const user = Object.values(db.tca?.user || {}).find(v => v.id === senderId);
      if (!user) return conn.sendMessage(chatId, { text: 'Kamu belum memiliki akun game!\nKetik *.create <nama>* untuk membuat akun.' }, { quoted: msg });

      const inv = user.inv || {};
      const axe = inv.axe || {};
      const akey = Object.keys(axe)[0];
      const aval = axe[akey];
      if (!akey) return conn.sendMessage(chatId, { text: 'Kamu tidak memiliki Axe!\nSilakan buat terlebih dahulu dengan perintah *.buat axe <material>' }, { quoted: msg });
      if (!aval || typeof aval.durabilty !== 'number') return conn.sendMessage(chatId, { text: `Axe ${akey} tidak valid atau rusak.` }, { quoted: msg });

      const jenis = Object.keys(wood)[Math.floor(Math.random() * Object.keys(wood).length)];
      const str = wood[jenis]?.str || 1;

      let amt = Math.round(str / 4);
      if ((str / 4) % 1 === 0.5) amt = Math.random() < 0.5 ? Math.floor(str / 4) : Math.ceil(str / 4);

      const loss = Math.ceil(amt / 10);
      const xp = Math.min(amt / 80, 1);

      inv.wood = inv.wood || {};
      inv.wood[jenis] = (inv.wood[jenis] || 0) + amt;

      aval.durabilty -= loss;
      if (aval.durabilty <= 0) delete axe[akey];

      user.lvl = Number(((user.lvl || 0) + xp).toFixed(2));
      user.tebang = `${amt}x ${jenis}`;

      fs.writeFileSync(gameFile, JSON.stringify(db, null, 2));

      const txt = `Menebang pohon berhasil!\n\nHasil Tebangan: ${jenis} x${amt}\nXP Tambahan: +${xp.toFixed(2)}\nDurabilitas ${akey}: ${aval?.durabilty ?? 0}`;
      conn.sendMessage(chatId, { text: txt }, { quoted: msg });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menebang pohon!' }, { quoted: msg });
    }
  }
};