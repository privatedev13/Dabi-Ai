const fs = require('fs');
const path = require('path');
const { loadPlug } = require('../../toolkit/helper');

const pluginDir = path.join(__dirname, '..');

module.exports = {
  name: 'setprefix',
  command: ['setprefix', 'prefix'],
  tags: 'Owner Menu',
  desc: 'Mengatur penggunaan prefix pada plugin',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    const send = text => conn.sendMessage(chatId, { text }, { quoted: msg });
    if (!(await isOwner(module.exports, conn, msg))) return;

    const updatePrefix = (file, val) => {
      try {
        let code = fs.readFileSync(file, 'utf8');
        if (!/prefix:\s*(true|false)/.test(code)) return false;
        fs.writeFileSync(file, code.replace(/prefix:\s*(true|false)/, `prefix: ${val}`));
        return true;
      } catch {
        return false;
      }
    };

    if (!args[0]) {
      const entries = Object.entries(global.plugins).filter(([_, p]) => typeof p.prefix === 'boolean');
      const [on, off] = [true, false].map(state => entries.filter(([_, p]) => p.prefix === state));
      const [list, label] = on.length <= off.length ? [on, 'ON'] : [off, 'OFF'];
      return send(`Plugin dengan prefix ${label} (${list.length}):\n${list.map(([n]) => `• ${n}`).join('\n')}`);
    }

    const [target, stateArg] = args.map(v => v.toLowerCase());
    if (!['on', 'off'].includes(stateArg)) return send('Contoh:\n.prefix autobio on\n.prefix all off');
    const bool = stateArg === 'on';

    if (target === 'all') {
      let count = 0;
      for (const folder of fs.readdirSync(pluginDir)) {
        const dir = path.join(pluginDir, folder);
        if (!fs.statSync(dir).isDirectory()) continue;
        for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
          if (updatePrefix(path.join(dir, file), bool)) count++;
        }
      }
      loadPlug();
      return send(`✅ Prefix semua plugin diubah ke ${stateArg.toUpperCase()} (${count} plugin diperbarui)`);
    }

    let filePath = null;
    for (const folder of fs.readdirSync(pluginDir)) {
      const dir = path.join(pluginDir, folder);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
        if (path.parse(file).name.toLowerCase() === target) {
          filePath = path.join(dir, file);
          break;
        }
      }
      if (filePath) break;
    }

    if (!filePath) return send(`Plugin "${target}" tidak ditemukan (berdasarkan nama file).`);
    if (updatePrefix(filePath, bool)) {
      loadPlug();
      return send(`✅ Prefix plugin "${target}" diubah ke ${stateArg.toUpperCase()}`);
    }
    send(`⚠️ Tidak ditemukan properti prefix pada plugin "${target}"`);
  }
};