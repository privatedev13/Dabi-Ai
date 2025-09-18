export default {
  name: 'bell',
  command: ['bell'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan fitur bell',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, {
          text: `Gunakan format: ${prefix + commandText} <on/off>`
        }, { quoted: msg });
      }

      const db = getDB();
      const value = args[0].toLowerCase() === 'on';

      if (isGroup) {
        const groupKey = Object.keys(db.Grup).find(k => db.Grup[k].Id === chatId);
        if (!groupKey) {
          return conn.sendMessage(chatId, {
            text: 'Grup ini belum terdaftar dalam database.'
          }, { quoted: msg });
        }

        db.Grup[groupKey].bell = value;
        saveDB();
        return conn.sendMessage(chatId, {
          text: `Fitur Bell untuk grup ini telah *${value ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: msg });

      } else {
        const userKey = Object.keys(db.Private).find(k => db.Private[k].Nomor === senderId);
        if (!userKey) {
          return conn.sendMessage(chatId, {
            text: 'Nomor kamu belum terdaftar dalam database.'
          }, { quoted: msg });
        }

        db.Private[userKey].bell = value;
        saveDB();
        return conn.sendMessage(chatId, {
          text: `Fitur Bell untuk kamu telah *${value ? 'diaktifkan' : 'dinonaktifkan'}*.`
        }, { quoted: msg });
      }

    } catch (err) {
      console.error('[Bell Plugin]', err);
      conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat memproses perintah.'
      }, { quoted: msg });
    }
  }
};