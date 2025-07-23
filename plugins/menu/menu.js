const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');
const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

module.exports = {
  name: 'menu',
  command: ['menuall', 'menu'],
  tags: 'Info Menu',
  desc: 'Menampilkan menu',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    const { chatId, pushName } = chatInfo;
    const category = args.join(' ').toLowerCase() || null;

    const rawDb = fs.readFileSync(dbPath, 'utf-8');
    const freshDb = JSON.parse(rawDb);
    const totalUser = Object.keys(freshDb.Private || {}).length;

    const menu = buildMenu(pushName, category, prefix, totalUser);

    await conn.sendMessage(chatId, {
      text: menu,
      contextInfo: {
        externalAdReply: {
          title: botFullName,
          body: `Ini Adalah Menu ${botName}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: idCh
        }
      }
    }, { quoted: msg });
  }
};

function buildMenu(sender, category, prefix, totalUser) {
  let txt = `Halo *${sender}*, Saya adalah asisten virtual yang siap membantu.\n`;
  txt += `Gunakan perintah di bawah untuk berinteraksi dengan saya.\n\n`;

  txt += `${head} ${Obrack} *Info ${botName}* ${Cbrack}\n`;
  txt += `${side} ${btn} Bot Name: ${botFullName}\n`;
  txt += `${side} ${btn} Owner: ${ownerName}\n`;
  txt += `${side} ${btn} Type: ${type}\n`;
  txt += `${side} ${btn} Tutorial: .help\n`;
  txt += `${side} ${btn} Total Cmd: ${Object.keys(global.plugins).length} Cmd\n`;
  txt += `${side} ${btn} Total User: ${totalUser}\n`;
  txt += `${side} ${btn} Versi: ${version}\n`;
  txt += `${side} ${btn} Baileys: ${baileys}\n`;
  txt += `${foot}${garis}\n\n`;

  txt += readmore;

  const categorized = {};
  for (const [name, plugin] of Object.entries(global.plugins)) {
    const tag = config.pluginCategories[plugin.tags] ? plugin.tags : 'Other Menu';
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
    if (!matched) {
      return `${txt}⚠ *Kategori '${category}' tidak ditemukan!*\nGunakan *.menuall* untuk melihat semua kategori yang tersedia.\n`;
    }
    txt += formatCommands(matched, categorized[matched]);
  } else {
    for (const cat of categories) {
      txt += formatCommands(cat, categorized[cat]);
    }
  }

  return txt + `${Obrack} ${footer} ${Cbrack}`;
}