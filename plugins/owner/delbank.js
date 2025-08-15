module.exports = {
  name: 'delbank',
  command: ['delbank'],
  tags: 'Owner Menu',
  desc: 'Mengurangi saldo atau tax pada bank',
  prefix: true,
  owner: true,

  run: async (conn, msg, { args, chatInfo }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;
    try {
      if (args.length < 2)
        return conn.sendMessage(chatId, { text: `Format:\n.delbank saldo 500\n.delbank tax 2%` }, { quoted: msg });

      const [type, val] = [args[0].toLowerCase(), args[1]];
      const bank = loadBank().bank;
      let num;

      if (type === 'saldo') {
        num = parseInt(val);
        if (isNaN(num))
          return conn.sendMessage(chatId, { text: `Jumlah saldo harus berupa angka.` }, { quoted: msg });
        if (bank.saldo - num < 0)
          return conn.sendMessage(chatId, { text: `Saldo tidak cukup.` }, { quoted: msg });

        bank.saldo -= num;
        saveBank({ bank });
        return conn.sendMessage(chatId, { text: `Saldo bank berhasil dikurangi ${num}. Saldo sekarang: ${bank.saldo}` }, { quoted: msg });

      } else if (type === 'tax') {
        num = parseFloat(val.replace('%', ''));
        if (isNaN(num))
          return conn.sendMessage(chatId, { text: `Tax harus berupa angka, misal 2%` }, { quoted: msg });

        let currentTax = parseFloat(bank.tax);
        if (currentTax - num < 0)
          return conn.sendMessage(chatId, { text: `Tax tidak bisa kurang dari 0%.` }, { quoted: msg });

        bank.tax = `${currentTax - num}%`;
        saveBank({ bank });
        return conn.sendMessage(chatId, { text: `Tax bank berhasil dikurangi ${num}%. Tax sekarang: ${bank.tax}` }, { quoted: msg });

      } else {
        return conn.sendMessage(chatId, { text: `Tipe tidak valid, gunakan: saldo atau tax.` }, { quoted: msg });
      }
    } catch (e) {
      console.error(e);
      conn.sendMessage(chatId, { text: `Terjadi kesalahan.` }, { quoted: msg });
    }
  }
};