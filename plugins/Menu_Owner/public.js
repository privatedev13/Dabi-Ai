const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'public',
  command: ['public'],
  tags: 'Owner Menu',
  desc: 'Mengatur mode publik bot',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;
      if (!(await onlyOwner(module.exports, conn, message))) return;

      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(
          chatId,
          { text: `⚠ Gunakan perintah: ${prefix}${commandText} on/off` },
          { quoted: message }
        );
      }

      const status = args[0].toLowerCase() === 'on';

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      config.botSetting.public = status;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      global.public = status;

      conn.sendMessage(
        chatId,
        { text: `✅ Mode publik telah ${status ? 'diaktifkan' : 'dimatikan'}` },
        { quoted: message }
      );
    } catch (error) {
      console.error('Error mengubah mode publik:', error);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan!' }, { quoted: message });
    }
  }
};