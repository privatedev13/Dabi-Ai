module.exports = {
  name: 'delisPrem',
  command: ['delprem', 'deleteisPremium'],
  tags: 'Owner Menu',
  desc: 'Menghapus status isPremium dari pengguna.',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      if (!(await isOwner(module.exports, conn, message))) return;

      if (args.length === 0 && !message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        return conn.sendMessage(chatId, {
          text: `📌 Gunakan format yang benar:\n\n*${prefix}${commandText} @tag*\natau\n*${prefix}${commandText} nomor*`
        }, { quoted: message });
      }

      intDB();
      const db = readDB();

      let targetNumber;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        targetNumber = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      }

      const userKey = getUser(db, targetNumber);

      if (!userKey) {
        return conn.sendMessage(chatId, {
          text: `❌ Pengguna tidak ada di database!`
        }, { quoted: message });
      }

      if (!db.Private[userKey].isPremium || !db.Private[userKey].isPremium.isPrem) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Pengguna *${userKey}* tidak memiliki status isPremium.`
        }, { quoted: message });
      }

      db.Private[userKey].isPremium.isPrem = false;
      db.Private[userKey].isPremium.time = 0;

      saveDB(db);

      conn.sendMessage(chatId, {
        text: `✅ Status isPremium *${userKey}* telah dihapus.`
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin delisPrem.js:', error);
      conn.sendMessage(chatId, {
        text: `⚠️ Terjadi kesalahan saat menghapus status isPremium!`
      }, { quoted: message });
    }
  },
};