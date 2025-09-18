export default {
  name: 'afk',
  command: ['afk'],
  tags: 'Info Menu',
  desc: 'Menandai kamu sedang AFK.',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { senderId, pushName, chatId, isGroup } = chatInfo;
    try {
      initDB();
      const db = getDB();

      const userKey = getUser(senderId);

      if (!isGroup) {
        return conn.sendMessage(chatId, { 
          text: "❌ Perintah ini hanya bisa digunakan dalam grup!" 
        }, { quoted: msg });
      }

      if (!userKey) {
        return conn.sendMessage(chatId, { 
          text: '❌ Kamu belum terdaftar! Ketik .daftar untuk mendaftar.' 
        }, { quoted: msg });
      }

      const alasan = args.join(' ') || 'Tidak ada alasan';
      const now = Date.now();

      db.Private[userKey.key].afk = {
        afkTime: now,
        reason: alasan
      };

      saveDB(db);

      return conn.sendMessage(chatId, {
        text: `🔕 *AFK Aktif*\n${pushName} sekarang sedang AFK\n📌 Alasan: ${alasan}`
      }, { quoted: msg });

    } catch (err) {
      console.error('AFK Error:', err);
      return conn.sendMessage(chatId, { 
        text: '⚠️ Terjadi kesalahan saat mengatur AFK.' 
      }, { quoted: msg });
    }
  }
};