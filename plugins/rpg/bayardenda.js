export default {
  name: 'Bayar Denda',
  command: ['bayar'],
  tags: 'Rpg Menu',
  desc: 'Bayar denda untuk keluar dari penjara',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    try {
      let db = getDB();
      let userKey = Object.keys(db.Private).find(k => db.Private[k].Nomor === senderId);
      let user = userKey ? db.Private[userKey] : null;

      if (!user) {
        await conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database.' }, { quoted: msg });
        return;
      }
      if (!user.jail) {
        await conn.sendMessage(chatId, { text: 'Kamu tidak sedang dipenjara.' }, { quoted: msg });
        return;
      }

      const bank = loadBank();
      const taxStr = bank.bank.tax || '0%';
      const pajak = parseFloat(taxStr.replace('%', '')) / 100;
      const denda = 50000;
      const total = denda + Math.floor(denda * pajak);

      if (user.money.amount < total) {
        await conn.sendMessage(chatId, { text: `Saldo kamu tidak cukup.\nDenda + pajak (${taxStr}): ${total}\nSaldo kamu: ${user.money.amount}` }, { quoted: msg });
        return;
      }

      user.money.amount -= total;
      user.jail = false;
      saveDB();

      bank.bank.saldo += total;
      saveBank(bank);

      await conn.sendMessage(chatId, { text: `Denda berhasil dibayar.\nTotal: ${total} (pajak ${taxStr})\nSaldo masuk bank: ${total}\nSisa saldo: ${user.money.amount}\nStatus penjara: Nonaktif` }, { quoted: msg });
    } catch {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membayar denda.' }, { quoted: msg });
    }
  }
};