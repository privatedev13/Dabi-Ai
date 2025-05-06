const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'listprem',
  command: ['listprem', 'listpremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna premium.',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!(await onlyOwner(module.exports, conn, message))) return;

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database Private tidak valid!' }, { quoted: message });
      }

      const premiumUsers = Object.entries(db.Private)
        .filter(([_, data]) => data.premium?.prem === true)
        .map(([name, data]) => ({
          name,
          number: data.Nomor,
          time: data.premium.time,
        }));

      if (premiumUsers.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Saat ini tidak ada pengguna premium.' }, { quoted: message });
      }

      let text = `${head} ${Obrack} *Daftar Pengguna Premium* ${Cbrack}\n${side}\n`;
      premiumUsers.forEach((user, index) => {
        const remainingTime = user.time > 0
          ? `${Math.floor(user.time / 3600000)} jam ${Math.floor((user.time % 3600000) / 60000)} menit`
          : 'Expired';
        text += `${side} ${btn} ${user.name} - wa.me/${user.number.replace('@s.whatsapp.net', '')}\n`;
        text += `${side}    ⏳ *Sisa Waktu:* ${remainingTime}\n${side}\n`;
      });

      text += `${side}Total: ${premiumUsers.length} pengguna premium.\n`;
      text += `${foot}${garis}`;

      conn.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin listprem.js:', error);
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat menampilkan daftar pengguna premium.`,
      }, { quoted: message });
    }
  },
};