const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../toolkit/set/config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const saveConfig = (newConfig) => {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
};

const ownerLastSapa = {};

module.exports = {
  name: 'forowner',
  command: ['forowner', forners],
  tags: 'Owner Menu',
  desc: 'Mengatur sambutan otomatis untuk Owner',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const senderId = message.participant || message.key.participant || message.key.remoteJid;
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return

    if (args[0] === "on") {
      config.ownerSetting.forOwner = true;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "✅ Fitur sambutan untuk Owner diaktifkan!" }, { quoted: message });

    } else if (args[0] === "off") {
      config.ownerSetting.forOwner = false;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "❌ Fitur sambutan untuk Owner dinonaktifkan!" }, { quoted: message });

    } else if (args[0] === "set") {
      let forOwnerTeks = textMessage.replace(`${prefix}forowner set`, "").trim();
      if (!forOwnerTeks) return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.forowner set <teks sambutan>" }, { quoted: message });

      config.msg.rejectMsg.forOwnerText = forOwnerTeks;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: `✅ Pesan sambutan diperbarui:\n\n${forOwnerTeks}` }, { quoted: message });

    } else if (args[0] === "reset") {
      config.msg.rejectMsg.forOwnerText = "";
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "✅ Pesan sambutan berhasil direset!" }, { quoted: message });

    } else {
      return conn.sendMessage(chatId, {
        text: `⚙️ Penggunaan:\n${prefix}forowner on → Aktifkan sambutan Owner\n${prefix}forowner off → Nonaktifkan sambutan Owner\n${prefix}forowner set <teks> → Atur teks sambutan\n${prefix}forowner reset → Reset teks sambutan`
      }, { quoted: message });
    }
  }
};