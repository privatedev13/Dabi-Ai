module.exports = {
  name: 'left',
  command: ['left'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur pesan keluar grup',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!isGroup)
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: message });

      const { userAdmin } = await stGrup(conn, chatId, senderId);
      if (!userAdmin)
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });

      if (args[0] === "on") {
        stGcL(chatId, true);
        return conn.sendMessage(chatId, { text: "✅ Fitur pesan keluar diaktifkan!" }, { quoted: message });

      } else if (args[0] === "off") {
        stGcL(chatId, false);
        return conn.sendMessage(chatId, { text: "❌ Fitur pesan keluar dinonaktifkan!" }, { quoted: message });

      } else if (args[0] === "set") {
        let leftText = textMessage.replace(`${prefix}left set`, "").trim();
        if (!leftText)
          return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.left set <teks selamat tinggal>" }, { quoted: message });

        stGcL(chatId, true, leftText);
        return conn.sendMessage(chatId, { text: `✅ Pesan selamat tinggal diperbarui:\n\n${leftText}` }, { quoted: message });

      } else if (args[0] === "restart") {
        const defaultText = "👋 Selamat tinggal @user!";
        stGcL(chatId, true, defaultText);
        return conn.sendMessage(chatId, { text: "✅ Pesan selamat tinggal direset ke default!" }, { quoted: message });

      } else {
        return conn.sendMessage(chatId, {
          text: `⚙️ Penggunaan:\n${prefix}${commandText} on → Aktifkan pesan keluar\n${prefix}${commandText} off → Nonaktifkan pesan keluar\n${prefix}${commandText} set <teks> → Atur teks pesan keluar\n${prefix}${commandText} restart → Reset teks pesan keluar ke default`
        }, { quoted: message });
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(chatId, {
        text: `Error: ${error.message || error}`
      }, { quoted: message });
    }
  }
};