const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../../toolkit/db/database.json');

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ Grup: {} }, null, 2));
}

const readDB = () => {
  let data = fs.readFileSync(dbFile, 'utf-8');
  return data ? JSON.parse(data) : { Grup: {} };
};

const saveDB = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'left',
  command: ['left'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur pesan keluar grup',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/\D/g, '');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;
    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: message });

    const groupMetadata = await conn.groupMetadata(chatId);
    const groupName = groupMetadata.subject;
    const admins = groupMetadata.participants.filter(participant => participant.admin);
    const isAdmin = admins.some(admin => admin.id.includes(senderId));

    if (!isAdmin) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" }, { quoted: message });

    if (args[0] === "on") {
      setLeftSettings(chatId, groupName, true);
      return conn.sendMessage(chatId, { text: "✅ Fitur pesan keluar diaktifkan!" }, { quoted: message });

    } else if (args[0] === "off") {
      setLeftSettings(chatId, groupName, false);
      return conn.sendMessage(chatId, { text: "❌ Fitur pesan keluar dinonaktifkan!" }, { quoted: message });

    } else if (args[0] === "set") {
      let leftText = textMessage.replace(`${prefix}left set`, "").trim();
      if (!leftText) return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.left set <teks selamat tinggal>" }, { quoted: message });

      setLeftSettings(chatId, groupName, true, leftText);
      return conn.sendMessage(chatId, { text: `✅ Pesan selamat tinggal diperbarui:\n\n${leftText}` }, { quoted: message });

    } else if (args[0] === "restart") {
      setLeftSettings(chatId, groupName, true, "👋 Selamat tinggal @user!");
      return conn.sendMessage(chatId, { text: "✅ Pesan selamat tinggal direset ke default!" }, { quoted: message });

    } else {
      return conn.sendMessage(chatId, {
        text: `⚙️ Penggunaan:\n${prefix}left on → Aktifkan pesan keluar\n${prefix}left off → Nonaktifkan pesan keluar\n${prefix}left set <teks> → Atur teks pesan keluar\n${prefix}left restart → Reset teks pesan keluar ke default`
      }, { quoted: message });
    }
  }
};