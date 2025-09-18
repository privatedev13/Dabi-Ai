export default {
  name: 'cekdompet',
  command: ['cekdompet', 'dompetcek'],
  tags: 'Fun Menu',
  desc: 'Cek dompet orang',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    const targetId = target(msg, senderId);
    const mention = `${targetId}@s.whatsapp.net`;

    try {
      initDB();
      const user = getUser(mention);

      if (!user?.value) {
        return conn.sendMessage(chatId, {
          text: `Pengguna belum terdaftar di database!\n\nKetik *.daftar* untuk mendaftar.`,
          mentions: [mention]
        }, { quoted: msg });
      }

      const moneyAmount = user.value.money?.amount ?? 0;
      const formattedMoney = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(moneyAmount);

      const teks = `Hasil investigasi dari dompet @${targetId}\n💰 ${formattedMoney} ditemukan`;

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [mention]
      }, { quoted: msg });

    } catch (err) {
      console.error("[cekdompet] Error:", err);
      await conn.sendMessage(chatId, {
        text: "Terjadi kesalahan saat memeriksa dompet."
      }, { quoted: msg });
    }
  }
};