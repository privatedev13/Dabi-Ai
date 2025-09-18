export default {
  name: 'Transfer Uang',
  command: ['tf', 'transfer'],
  tags: 'Rpg Menu',
  desc: 'Mentransfer uang',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    if (!args.length && !ctx) {
      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n\n*${prefix}${commandText} @tag 10000*\n*${prefix}${commandText} 628xxxx 10000*\n*balas pesan lalu ketik ${prefix}${commandText} 10000*`
      }, { quoted: msg });
    }

    try {
      initDB();
      const db = getDB();
      const dbUser = db.Private;

      let target = ctx?.mentionedJid?.[0] || ctx?.participant;
      let amount = parseInt(args.find(a => /^\d+$/.test(a)));

      if (!target && args.length >= 2) {
        const num = args.find(a => /^\d{8,}$/.test(a));
        const amt = args.find(a => /^\d{1,7}$/.test(a));
        if (num) target = num.replace(/\D/g, '') + '@s.whatsapp.net';
        if (amt) amount = parseInt(amt);
      }

      if (!target?.endsWith('@s.whatsapp.net')) {
        return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan!' }, { quoted: msg });
      }

      if (!amount || amount <= 0) {
        return conn.sendMessage(chatId, { text: 'Jumlah uang tidak valid! Contoh: 10000' }, { quoted: msg });
      }

      target = target.toLowerCase().trim();
      const pengirimKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === senderId);
      const targetKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === target);

      if (!pengirimKey) return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database!' }, { quoted: msg });
      if (!targetKey) return conn.sendMessage(chatId, { text: 'Pengguna tujuan belum terdaftar di database!' }, { quoted: msg });

      const pengirim = dbUser[pengirimKey];
      const penerima = dbUser[targetKey];

      pengirim.money = pengirim.money || { amount: 0 };
      penerima.money = penerima.money || { amount: 0 };

      if (pengirim.money.amount < amount) {
        return conn.sendMessage(chatId, {
          text: `Saldo kamu tidak cukup! Saldo kamu hanya Rp${pengirim.money.amount.toLocaleString('id-ID')}`
        }, { quoted: msg });
      }

      pengirim.money.amount -= amount;
      penerima.money.amount += amount;
      saveDB(db);

      conn.sendMessage(chatId, {
        text: `Transfer berhasil!\n\n*Dari:* ${pengirimKey}\n*Ke:* ${targetKey}\n*Jumlah:* Rp${amount.toLocaleString('id-ID')}`
      }, { quoted: msg });

    } catch (err) {
      console.error('Error transfer.js:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mentransfer uang!' }, { quoted: msg });
    }
  }
}