const fs = require('fs');
const path = require('path');
const menuCh = require('../@set/setMenu-1.js');
const menuDoc = require('../@set/setMenu-2.js');
const menuteks = require('../@set/setMenu-3.js');

const configPath = path.join(__dirname, '../../toolkit/set/config.json');
const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
const more = String.fromCharCode(8206), readmore = more.repeat(4001);

const loadConfig = () => {
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
};

const handlers = { 1: menuCh, 2: menuDoc, 3: menuteks };

const menuModule = {
  name: 'menu',
  command: ['menu', 'menuall'],
  tags: 'Info Menu',
  desc: 'Menampilkan menu sesuai mode',
  prefix: true,

  run: async (conn, msg, ctx) => {
    const config = loadConfig();
    const handler = handlers[config.menuSetting.setMenu];
    if (!handler) return conn.sendMessage(ctx.chatInfo.chatId, { text: `Mode menu tidak valid. Gunakan setmenu ${Object.keys(handlers).join(' atau ')}` }, { quoted: msg });
    try {
      const category = ctx.args.join(' ').toLowerCase() || null;
      return handler.run(conn, msg, ctx, buildMenu(ctx.chatInfo.pushName, category, ctx.prefix));
    } catch (e) {
      console.error('Menu error:', e);
      await conn.sendMessage(ctx.chatInfo.chatId, { text: 'Terjadi kesalahan saat membuka menu.' }, { quoted: msg });
    }
  }
};

module.exports = { ...menuModule, handlers };

function buildMenu(sender, category, prefix) {
  const freshDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const totalUser = Object.keys(freshDb.Private || {}).length;
  let txt = `Halo *${sender}*, Saya adalah asisten virtual.\n\n`;
  txt += `${head} ${Obrack} *Info ${botName}* ${Cbrack}\n`;
  txt += `${side} ${btn} Bot Name: ${botFullName}\n`;
  txt += `${side} ${btn} Owner: ${ownerName}\n`;
  txt += `${side} ${btn} Type: ${type}\n`;
  txt += `${side} ${btn} Tutorial: .help\n`;
  txt += `${side} ${btn} Total Cmd: ${countPlugins()}\n`;
  txt += `${side} ${btn} Total User: ${totalUser}\n`;
  txt += `${side} ${btn} Versi: ${version}\n`;
  txt += `${side} ${btn} Baileys: ${baileys}\n`;
  txt += `${foot}${garis}\n\n${readmore}`;
  const categorized = {};
  for (const [name, plugin] of Object.entries(global.plugins)) {
    if (plugin.__path && plugin.__path.includes('/@set/')) continue;
    const tag = loadConfig().pluginCategories[plugin.tags] ? plugin.tags : 'Other Menu';
    (categorized[tag] ||= []).push(name);
  }
  const categories = Object.keys(categorized).sort();
  const formatCommands = (title, commands) => {
    let section = `${head} ${Obrack} *${title}* ${Cbrack}\n`;
    commands.sort().forEach(cmd => {
      const prem = global.plugins[cmd]?.premium ? ' *[ premium ]*' : '';
      section += `${side} ${btn} ${prefix}${cmd}${prem}\n`;
    });
    return section + `${foot}${garis}\n\n`;
  };
  if (category) {
    const matched = categories.find(c => c.toLowerCase().includes(category));
    txt += matched ? formatCommands(matched, categorized[matched]) : `Kategori '${category}' tidak ditemukan!`;
  } else {
    for (const cat of categories) txt += formatCommands(cat, categorized[cat]);
  }
  return txt + `${Obrack} ${footer} ${Cbrack}`;
}

function countPlugins() {
  return Object.values(global.plugins).filter(p => !(p.__path && p.__path.includes(path.join('plugins', '@set')))).length;
}