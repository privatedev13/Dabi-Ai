module.exports = {
  name: 'welcome',
  command: ['welcome'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur welcome di grup',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: message });  

      const db = readDB();
      const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
      if (!groupData) {
        return conn.sendMessage(chatId, { text: "❌ Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar." }, { quoted: message });
      }

      const groupMetadata = await conn.groupMetadata(chatId);  
      const groupName = groupMetadata.subject;  
      const admins = groupMetadata.participants.filter(participant => participant.admin);  
      const isAdmin = admins.some(admin => admin.id.includes(senderId));  

      if (!isAdmin) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" }, { quoted: message });  

      if (args[0] === "on") {  
        setWelcomeSettings(chatId, groupName, true);  
        return conn.sendMessage(chatId, { text: "✅ Fitur welcome diaktifkan!" }, { quoted: message });  

      } else if (args[0] === "off") {  
        setWelcomeSettings(chatId, groupName, false);  
        return conn.sendMessage(chatId, { text: "❌ Fitur welcome dinonaktifkan!" }, { quoted: message });  

      } else if (args[0] === "set") {  
        let welcomeText = textMessage.replace(`${prefix}welcome set`, "").trim();  
        if (!welcomeText) return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.welcome set <teks selamat datang>" }, { quoted: message });  

        setWelcomeSettings(chatId, groupName, true, welcomeText);  
        return conn.sendMessage(chatId, { text: `✅ Pesan selamat datang diperbarui:\n\n${welcomeText}` }, { quoted: message });  

      } else {  
        return conn.sendMessage(chatId, {  
          text: `⚙️ Penggunaan:\n${prefix}welcome on → Aktifkan welcome\n${prefix}welcome off → Nonaktifkan welcome\n${prefix}welcome set <teks> → Atur teks welcome`  
        }, { quoted: message });  
      }
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
};