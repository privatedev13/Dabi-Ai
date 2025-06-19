const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'listisPrem',
  command: ['listprem', 'listisPremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna isPremium.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, msg))) return;

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: msg });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database Private tidak valid!' }, { quoted: msg });
      }

      const isPremiumUsers = Object.entries(db.Private)
        .filter(([_, data]) => data.isPremium?.isPrem === true)
        .map(([name, data]) => ({
          name,
          number: data.Nomor,
          time: data.isPremium.time,
        }));

      if (isPremiumUsers.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Saat ini tidak ada pengguna isPremium.' }, { quoted: msg });
      }

      let text = `${head} ${Obrack} *Daftar Pengguna Premium* ${Cbrack}\n${side}\n`;
      isPremiumUsers.forEach((user, index) => {
        let remaining = user.time;
        let remainingTime = 'Expired';

        if (remaining > 0) {
          const days = Math.floor(remaining / 86400000);
          remaining %= 86400000;
          const hours = Math.floor(remaining / 3600000);
          remaining %= 3600000;
          const minutes = Math.floor(remaining / 60000);

          remainingTime = `${days} hari ${hours} jam ${minutes} menit`;
        }

        text += `${side} ${btn} ${user.name} - wa.me/${user.number.replace('@s.whatsapp.net', '')}\n`;
        text += `${side}    ⏳ *Sisa Waktu:* ${remainingTime}\n${side}\n`;
      });

      text += `${side}Total: ${isPremiumUsers.length} pengguna premium.\n${side}\n`;
      text += `${foot}${garis}`;

      conn.sendMessage(chatId, { text }, { quoted: msg });
    } catch (error) {
      console.error('Error di plugin listisPrem.js:', error);
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat menampilkan daftar pengguna premium.`,
      }, { quoted: msg });
    }
  },
};