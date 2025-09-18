import fs from 'fs';
import path from 'path';
const configPath = path.resolve('./toolkit/set/config.json');

export default {
  name: 'public',
  command: ['public'],
  tags: 'Owner Menu',
  desc: 'Mengatur mode publik bot',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    const input = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(input)) {
      return conn.sendMessage(chatId, { text: `⚠ Gunakan perintah:\n${prefix}${commandText} on/off\n\nStatus: ${global.public}` }, { quoted: msg });
    }

    try {
      const status = input === 'on';
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      config.botSetting.public = status;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      global.public = status;

      conn.sendMessage(chatId, { text: `✅ Mode publik telah ${status ? 'diaktifkan' : 'dimatikan'}` }, { quoted: msg });
    } catch (e) {
      console.error('Error mengubah mode publik:', e);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan!' }, { quoted: msg });
    }
  }
};