module.exports = {
  name: 'Rampok',
  command: ['rampok'],
  tags: 'Rpg Menu',
  desc: 'Merampok saldo pengguna lain',
  prefix: true,

  run: async (conn, msg, { chatInfo, prefix, commandText, args }) => {
    const { chatId, senderId } = chatInfo;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    if (!args.length && !ctx) {
      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n\n${prefix}${commandText} @tag\n${prefix}${commandText} 628xxxx\nBalas pesan lalu ketik ${prefix}${commandText}`
      }, { quoted: msg });
    }

    try {
      intDB();
      const db = getDB();
      const dbUser = db.Private;

      let target = ctx?.mentionedJid?.[0] || ctx?.participant;
      if (!target && args.length) {
        const num = args.find(a => /^\d{8,}$/.test(a));
        if (num) target = num.replace(/\D/g, '') + '@s.whatsapp.net';
      }
      if (!target?.endsWith('@s.whatsapp.net')) {
        return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan' }, { quoted: msg });
      }

      target = target.toLowerCase().trim();
      if (target === senderId) {
        return conn.sendMessage(chatId, { text: 'Tidak bisa merampok diri sendiri' }, { quoted: msg });
      }

      const pelakuKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === senderId);
      const targetKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === target);

      if (!pelakuKey) return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database' }, { quoted: msg });
      if (!targetKey) return conn.sendMessage(chatId, { text: 'Target belum terdaftar di database' }, { quoted: msg });

      const pelaku = dbUser[pelakuKey];
      const korban = dbUser[targetKey];

      if (pelaku.jail) {
        return conn.sendMessage(chatId, { text: 'Kamu sedang di penjara dan tidak bisa merampok.' }, { quoted: msg });
      }

      pelaku.money = pelaku.money || { amount: 0 };
      korban.money = korban.money || { amount: 0 };

      if (korban.money.amount <= 0) {
        return conn.sendMessage(chatId, { text: 'Target tidak punya uang untuk dirampok' }, { quoted: msg });
      }

      const success = Math.random() < 0.5;
      const maxRampok = Math.min(korban.money.amount, 10000);
      const hasil = Math.floor(Math.random() * maxRampok) + 1000;

      if (success) {
        korban.money.amount -= hasil;
        pelaku.money.amount += hasil;
        saveDB(db);
        return conn.sendMessage(chatId, { text: `Berhasil merampok Rp${hasil.toLocaleString('id-ID')} dari target` }, { quoted: msg });
      } else {
        if (Math.random() < 0.3) {
          pelaku.jail = true;
          saveDB(db);
          return conn.sendMessage(chatId, { text: 'Rampok gagal. Kamu tertangkap dan masuk penjara!' }, { quoted: msg });
        }
        return conn.sendMessage(chatId, { text: 'Rampok gagal. Target berhasil kabur' }, { quoted: msg });
      }

    } catch (err) {
      console.error('Error rampok.js:', err);
      return conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat merampok' }, { quoted: msg });
    }
  }
}