const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autotyping',
  command: ['autotyping', 'at'],
  tags: 'Owner Menu',
  desc: 'Mengatur autotyping bot',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    const configPath = path.join(__dirname, '../../toolkit/set/config.json');

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca konfigurasi bot.' }, { quoted: message });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🔹 *Status Auto Typing:* ${config.botSetting.autoTyping ? '✅ Aktif' : '❌ Nonaktif'}\n\n➤ *Gunakan:*\n${prefix}${commandText} on/off ➝ Atur Auto Typing`
      }, { quoted: message });
    }

    let state = args[0].toLowerCase();

    if (!['on', 'off'].includes(state)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *on* atau *off*` }, { quoted: message });
    }

    config.botSetting.autoTyping = state === 'on';

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal menyimpan konfigurasi.' }, { quoted: message });
    }

    global.autoTyping = config.botSetting.autoTyping;

    conn.sendMessage(chatId, { text: `✅ Auto Typing telah *${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*!` }, { quoted: message });
  }
};