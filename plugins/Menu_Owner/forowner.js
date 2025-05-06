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
  command: ['forowner', 'forners'],
  tags: 'Owner Menu',
  desc: 'Mengatur sambutan otomatis untuk Owner',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

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
      let forOwnerTeks = textMessage.slice((prefix + commandText + ' set').length).trim();
      if (!forOwnerTeks) return conn.sendMessage(chatId, { text: `⚠️ Gunakan perintah:\n${prefix}${commandText} set <teks sambutan>` }, { quoted: message });

      config.msg.rejectMsg.forOwnerText = forOwnerTeks;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: `✅ Pesan sambutan diperbarui:\n\n${forOwnerTeks}` }, { quoted: message });

    } else if (args[0] === "reset") {
      config.msg.rejectMsg.forOwnerText = "";
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "✅ Pesan sambutan berhasil direset!" }, { quoted: message });

    } else {
      return conn.sendMessage(chatId, {
        text: `⚙️ Penggunaan:\n${prefix}${commandText} on → Aktifkan sambutan Owner\n${prefix}${commandText} off → Nonaktifkan sambutan Owner\n${prefix}${commandText} set <teks> → Atur teks sambutan\n${prefix}${commandText} reset → Reset teks sambutan`
      }, { quoted: message });
    }
  }
};