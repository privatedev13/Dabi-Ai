const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../toolkit/set/config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const saveConfig = (cfg) => fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

module.exports = {
  name: 'forowner',
  command: ['forowner', 'forners'],
  tags: 'Owner Menu',
  desc: 'Atur sambutan untuk Owner',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    const cmd = `${prefix}${commandText}`;
    const input = args[0];

    if (input === "on" || input === "off") {
      config.ownerSetting.forOwner = input === "on";
      saveConfig(config);
      return conn.sendMessage(chatId, { text: `Sambutan Owner ${input === "on" ? 'diaktifkan' : 'dimatikan'}.` }, { quoted: msg });
    }

    if (input === "set") {
      const teks = textMessage.slice((cmd + ' set').length).trim();
      if (!teks) return conn.sendMessage(chatId, { text: `Gunakan: ${cmd} set <teks>` }, { quoted: msg });

      config.msg.rejectMsg.forOwnerText = teks;
      saveConfig(config);
      return conn.sendMessage(chatId, { text: `Teks sambutan disimpan:\n\n${teks}` }, { quoted: msg });
    }

    if (input === "reset") {
      config.msg.rejectMsg.forOwnerText = "";
      saveConfig(config);
      return conn.sendMessage(chatId, { text: "Teks sambutan dikosongkan." }, { quoted: msg });
    }

    return conn.sendMessage(chatId, {
      text: [
        `Penggunaan:`,
        `${cmd} on     → Aktifkan`,
        `${cmd} off    → Nonaktifkan`,
        `${cmd} set <teks> → Atur teks`,
        `${cmd} reset  → Kosongkan teks`
      ].join('\n')
    }, { quoted: msg });
  }
};