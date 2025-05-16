module.exports = {
  name: 'resetaichat',
  command: ['resetaichat', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset data Auto-AI pada pengguna atau grup',
  prefix: true,
  owner: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!(await isOwner(module.exports, conn, message))) return;

      if (args.length < 1) {
        return conn.sendMessage(chatId, {
          text: `📌 *Cara penggunaan:*\n\n${prefix}resetaichat group (id grup)\n${prefix}resetaichat pengguna (nomor) atau reply pesan pengguna.` }, { quoted: message });
      }

      let db = readDB();
      if (!Array.isArray(db.autoai)) db.autoai = [];

      const type = args[0]?.toLowerCase();
      let targetId;

      if (type === 'pengguna') {
        if (args.length > 1) {
          targetId = args[1].replace(/\D/g, '');
        } else if (quotedMessage) {
          targetId = quotedMessage.split('@')[0];
        } else {
          return conn.sendMessage(chatId, {
            text: '⚠️ Silakan ketik `.resetaichat pengguna <nomor>` atau reply pesan pengguna yang ingin direset.'
          }, { quoted: message });
        }
      } else if (type === 'group') {
        if (args.length < 2) {
          return conn.sendMessage(chatId, {
            text: `⚠️ Untuk reset grup, masukkan ID grup!\n\nContoh: *${prefix}resetaichat group 1203630253289987*`
          }, { quoted: message });
        }
        targetId = args[1].replace(/\D/g, '');
      } else {
        return conn.sendMessage(chatId, {
          text: `⚠️ Jenis reset tidak valid! Gunakan *pengguna* atau *group*.\n\nContoh: *${prefix}resetaichat pengguna 6281234567890*`
        }, { quoted: message });
      }

      if (!targetId) {
        return conn.sendMessage(chatId, {
          text: '⚠️ ID tidak valid!'
        }, { quoted: message });
      }

      const formattedId = type === 'group' ? `${targetId}@g.us` : `${targetId}@s.whatsapp.net`;

      const entryIndex = db.autoai.findIndex(entry => entry[formattedId]);

      if (entryIndex !== -1) {
        db.autoai.splice(entryIndex, 1);
        saveDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Data Auto-AI untuk *${type}* dengan ID *${targetId}* telah direset.`
        }, { quoted: message });
      } else {
        return conn.sendMessage(chatId, {
          text: `⚠️ Tidak ditemukan data Auto-AI untuk *${type}* dengan ID *${targetId}*.`
        }, { quoted: message });
      }
      
    } catch (error) {
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan: ${error.message || error}`
      }, { quoted: message });
    }
  },
};