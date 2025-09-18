export default {
  name: 'left',
  command: ['left'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur pesan keluar grup',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: "Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: msg });
    }

    const groupData = getGc(getDB(), chatId);

    if (!groupData) {
      return conn.sendMessage(chatId, { text: "Grup belum terdaftar.\nGunakan *.daftargc* untuk mendaftar." }, { quoted: msg });
    }

    const { userAdmin } = await exGrup(conn, chatId, senderId);
    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
    }

    const sub = args[0]?.toLowerCase();
    groupData.gbFilter ??= {};
    groupData.gbFilter.Left ??= { gcLeft: false, leftText: '' };
    const leftConfig = groupData.gbFilter.Left;

    const saveAndReply = (text) => {
      saveDB();
      return conn.sendMessage(chatId, { text }, { quoted: msg });
    };

    switch (sub) {
      case "on":
        leftConfig.gcLeft = true;
        return saveAndReply("Fitur pesan keluar diaktifkan!");

      case "off":
        leftConfig.gcLeft = false;
        return saveAndReply("Fitur pesan keluar dinonaktifkan!");

      case "set": {
        const newText = textMessage.replace(`${prefix}${commandText} set`, "").trim();
        if (!newText) {
          return conn.sendMessage(chatId, { text: "Gunakan perintah:\n.left set <teks selamat tinggal>" }, { quoted: msg });
        }
        Object.assign(leftConfig, { gcLeft: true, leftText: newText });
        return saveAndReply(`Pesan selamat tinggal diperbarui:\n\n${newText}`);
      }

      case "restart":
        Object.assign(leftConfig, { gcLeft: true, leftText: "Selamat tinggal @user!" });
        return saveAndReply("Pesan selamat tinggal direset ke default!");

      default:
        return conn.sendMessage(chatId, {
          text:
            `Penggunaan:\n` +
            `${prefix}${commandText} on → Aktifkan pesan keluar\n` +
            `${prefix}${commandText} off → Nonaktifkan pesan keluar\n` +
            `${prefix}${commandText} set <teks> → Atur teks pesan keluar\n` +
            `${prefix}${commandText} restart → Reset teks pesan keluar ke default`
        }, { quoted: msg });
    }
  }
};