const fs = require('fs');
const tokoPath = './toolkit/set/toko.json';

module.exports = {
  name: 'resettoko',
  command: ['resettoko'],
  tags: 'Shop Menu',
  desc: 'Mereset daftar toko di toko.json (hanya storeSetting)',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!(await onlyOwner(module.exports, conn, message))) return;

      if (!fs.existsSync(tokoPath)) {
        return conn.sendMessage(chatId, { text: "❌ File toko.json tidak ditemukan." }, { quoted: message });
      }

      let tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'));
      tokoData.storeSetting = {};
      fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

      conn.sendMessage(chatId, { text: "✅ Semua toko telah direset!" }, { quoted: message });

    } catch (err) {
      console.error("❌ Error di plugin resettoko.js:", err);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat mereset toko." }, { quoted: message });
    }
  }
};