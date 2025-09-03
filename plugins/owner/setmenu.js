const fs = require('fs');
const path = require('path');
const { handlers } = require('../menu/menu.js');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

const loadConfig = () => {
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
};

module.exports = {
  name: 'setmenu',
  command: ['setmenu'],
  tags: 'Owner Menu',
  desc: 'Ubah tampilan menu bot',
  prefix: true,
  owner: true,
  run: async (conn, msg, { chatInfo, args }) => {
    if (!(await isOwner(module.exports, conn, msg))) return;
    const { chatId } = chatInfo;
    const validModes = Object.keys(handlers);
    const mode = args[0];
    if (!mode || !validModes.includes(mode)) {
      return conn.sendMessage(chatId, { text: `Gunakan: setmenu ${validModes.join(' atau ')}` }, { quoted: msg });
    }
    try {
      const config = loadConfig();
      config.menuSetting.setMenu = parseInt(mode);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      await conn.sendMessage(chatId, { text: `Menu berhasil diubah ke mode ${loadConfig().menuSetting.setMenu}` }, { quoted: msg });
    } catch (err) {
      await conn.sendMessage(chatId, { text: `Gagal mengubah menu: ${err.message}` }, { quoted: msg });
    }
  }
};