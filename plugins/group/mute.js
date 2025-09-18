export default {
  name: 'mute',
  command: ['mute'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau nonaktifkan mode mute grup',
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
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });

      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
      if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

        const groupData = getGc(getDB(), chatId);
      if (!groupData) {
        return conn.sendMessage(chatId, { text: "Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar." }, { quoted: msg });
      }

      const action = args[0]?.toLowerCase();

      if (action === 'on') {
        if (groupData.mute) return conn.sendMessage(chatId, { text: 'Mode mute sudah aktif di grup ini.' }, { quoted: msg });
        groupData.mute = true;
        saveDB();
        return conn.sendMessage(chatId, { text: 'Mode mute diaktifkan. Hanya admin yang dapat menggunakan bot.' }, { quoted: msg });
      }

      if (action === 'off') {
        if (!groupData.mute) return conn.sendMessage(chatId, { text: 'Mode mute tidak aktif di grup ini.' }, { quoted: msg });
        groupData.mute = false;
        saveDB();
        return conn.sendMessage(chatId, { text: 'Mode mute dinonaktifkan. Semua member dapat menggunakan bot.' }, { quoted: msg });
      }

      return conn.sendMessage(chatId, {
        text: `Penggunaan:\n${prefix}${commandText} on → Aktifkan mode mute\n${prefix}${commandText} off → Nonaktifkan mode mute`
      }, { quoted: msg });
    } catch (err) {
      console.error('Mute Command Error:', err);
      return conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat menjalankan perintah.' }, { quoted: msg });
    }
  },
};