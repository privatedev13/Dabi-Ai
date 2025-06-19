module.exports = {
  name: 'delisPrem',
  command: ['delprem', 'deleteisPremium'],
  tags: 'Owner Menu',
  desc: 'Menghapus status isPremium dari pengguna.',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    try {
      if (!(await isOwner(module.exports, conn, msg))) return;

      if (args.length === 0 && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        return conn.sendMessage(chatId, {
          text: `📌 Gunakan format yang benar:\n\n*${prefix}${commandText} @tag*\natau\n*${prefix}${commandText} nomor*`
        }, { quoted: msg });
      }

      intDB();
      const db = readDB();

      let targetNumber;
      if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else {
        targetNumber = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      }

      const userKey = Object.keys(db.Private).find(key => db.Private[key].Nomor === targetNumber);

      if (!userKey) {
        return conn.sendMessage(chatId, {
          text: `❌ Pengguna tidak ada di database!`
        }, { quoted: msg });
      }

      if (!db.Private[userKey].isPremium?.isPrem) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Pengguna *${userKey}* tidak memiliki status isPremium.`
        }, { quoted: msg });
      }

      db.Private[userKey].isPremium.isPrem = false;
      db.Private[userKey].isPremium.time = 0;

      saveDB(db);

      conn.sendMessage(chatId, {
        text: `✅ Status isPremium *${userKey}* telah dihapus.`
      }, { quoted: msg });

    } catch (error) {
      console.error('Error di plugin delisPrem.js:', error);
      conn.sendMessage(chatId, {
        text: `⚠️ Terjadi kesalahan saat menghapus status isPremium!`
      }, { quoted: msg });
    }
  },
};