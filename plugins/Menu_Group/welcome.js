module.exports = {
  name: 'welcome',
  command: ['welcome'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur welcome di grup',
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

      const { userAdmin, groupName } = await stGrup(conn, chatId, senderId);
      if (!userAdmin)
        return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });

      if (args[0] === "on") {
        stGcW(chatId, true);
        return conn.sendMessage(chatId, { text: "✅ Fitur welcome diaktifkan!" }, { quoted: message });

      } else if (args[0] === "off") {
        stGcW(chatId, false);
        return conn.sendMessage(chatId, { text: "❌ Fitur welcome dinonaktifkan!" }, { quoted: message });

      } else if (args[0] === "set") {
        let welcomeText = textMessage.replace(`${prefix}welcome set`, "").trim();
        if (!welcomeText)
          return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.welcome set <teks selamat datang>" }, { quoted: message });

        stGcW(chatId, true, welcomeText);
        return conn.sendMessage(chatId, { text: `✅ Pesan selamat datang diperbarui:\n\n${welcomeText}` }, { quoted: message });

      } else {
        return conn.sendMessage(chatId, {
          text: `⚙️ Penggunaan:\n${prefix}welcome on → Aktifkan welcome\n${prefix}welcome off → Nonaktifkan welcome\n${prefix}welcome set <teks> → Atur teks welcome`
        }, { quoted: message });
      }

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`
      }, { quoted: message });
    }
  }
};