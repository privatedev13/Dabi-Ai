import fs from 'fs';
import path from 'path';

const configPath = path.resolve('./toolkit/set/config.json');

export default {
  name: 'autobio',
  command: ['autobio', 'bio'],
  tags: 'Owner Menu',
  desc: 'Mengatur autobio',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;
    const option = args[0]?.toLowerCase();

    if (!option || !['on', 'off'].includes(option)) {
      return conn.sendMessage(
        chatId,
        { text: `Gunakan: ${prefix}${commandText} on/off\n\nStatus autobio: ${global.autoBio}` },
        { quoted: msg }
      );
    }

    const status = option === 'on';
    global.autoBio = status;

    if (global.setting?.botSetting) {
      global.setting.botSetting.autoBio = status;
      try {
        fs.writeFileSync(configPath, JSON.stringify(global.setting, null, 2));
      } catch {
        return conn.sendMessage(chatId, { text: 'Gagal menyimpan pengaturan ke config.json' }, { quoted: msg });
      }
    }

    await conn.sendMessage(
      chatId,
      { text: `Auto Bio telah ${status ? 'diaktifkan' : 'dimatikan'}` },
      { quoted: msg }
    );

    if (status && global.updateBio) global.updateBio(conn);
  }
};