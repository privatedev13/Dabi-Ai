import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

export default {
  name: 'mode',
  command: ['mode'],
  tags: 'Owner Menu',
  desc: 'Ubah mode bot menjadi group/private/off',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;
    const mode = args[0]?.toLowerCase();
    const validModes = ['group', 'private', 'off'];

    if (!validModes.includes(mode)) {
      return conn.sendMessage(chatId, {
        text: `⚠️ Mode tidak valid!\n\nContoh:\n${prefix}${commandText} group\n${prefix}${commandText} private\n${prefix}${commandText} off\n\nMode saat ini: *${global.setting?.botSetting?.Mode || 'unknown'}*`
      }, { quoted: msg });
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath));
      config.botSetting = { ...config.botSetting, Mode: mode };
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return conn.sendMessage(chatId, { text: `✅ Mode bot diubah menjadi *${mode}*.` }, { quoted: msg });
    } catch {
      return conn.sendMessage(chatId, { text: '❌ Gagal mengubah mode bot.' }, { quoted: msg });
    }
  }
};