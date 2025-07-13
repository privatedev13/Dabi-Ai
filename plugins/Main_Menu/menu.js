const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const config = require('../../toolkit/set/config.json');
const db = require('../../toolkit/db/database.json');

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
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup, pushName } = chatInfo;
    const requestedCategory = args.length ? args.join(' ').toLowerCase() : null;
    const totalUser = Object.keys(db.Private || {}).length;
    const menuText = getMenuText(pushName, requestedCategory, prefix, totalUser);

    await conn.sendMessage(chatId, {
      text: menuText,
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
          newsletterJid: '120363310100263711@newsletter'
        }
      }
    }, { quoted: msg });
  }
};

function getMenuText(sender, requestedCategory, prefix, totalUser) {
  let menuText = `Halo *${sender}*, Saya adalah asisten virtual yang siap membantu.\n`;
  menuText += `Gunakan perintah di bawah untuk berinteraksi dengan saya.\n\n`;

  menuText += `${head} ${Obrack} *Info ${botName}* ${Cbrack}\n`;
  menuText += `${side} ${btn} Bot Name: ${botFullName}\n`;
  menuText += `${side} ${btn} Owner: ${ownerName}\n`;
  menuText += `${side} ${btn} Type: ${type}\n`;
  menuText += `${side} ${btn} Tutorial: .help\n`;
  menuText += `${side} ${btn} Total Cmd: ${Object.keys(global.plugins).length} Cmd\n`;
  menuText += `${side} ${btn} Total User: ${totalUser}\n`
  menuText += `${side} ${btn} Versi: ${version}\n`;
  menuText += `${side} ${btn} Baileys: ${baileys}\n`;
  menuText += `${foot}${garis}\n\n`;

  menuText += `${readmore}`;

  let categorizedCommands = {};
  for (const [pluginName, plugin] of Object.entries(global.plugins)) {
    let category = plugin.tags || "Other Menu";
    if (!config.pluginCategories[category]) category = "Other Menu";
    if (!categorizedCommands[category]) categorizedCommands[category] = [];
    categorizedCommands[category].push(pluginName);
  }

  let sortedCategories = Object.keys(categorizedCommands).sort();

  if (requestedCategory) {
    const matchedCategory = sortedCategories.find(cat =>
      cat.toLowerCase().includes(requestedCategory)
    );

    if (!matchedCategory) {
      menuText += `⚠ *Kategori '${requestedCategory}' tidak ditemukan!*\n`;
      menuText += `Gunakan *.menuall* untuk melihat semua kategori yang tersedia.\n`;
      return menuText;
    }

    let commands = categorizedCommands[matchedCategory];
    commands.sort();

    menuText += `${head} ${Obrack} *${matchedCategory}* ${Cbrack}\n`;
    commands.forEach((cmd) => {
      menuText += `${side} ${btn} ${prefix}${cmd}\n`;
    });
    menuText += `${foot}${garis}\n\n`;
  } else {
    for (const category of sortedCategories) {
      let commands = categorizedCommands[category];
      commands.sort();

      menuText += `${head} ${Obrack} *${category}* ${Cbrack}\n`;
      commands.forEach((cmd) => {
        const plugin = global.plugins[cmd];
        const prem = plugin && plugin.premium === true;
        const isPremiumLabel = prem ? ' *[ premium ]*' : '';
        menuText += `${side} ${btn} ${prefix}${cmd}${isPremiumLabel}\n`;
      });
      menuText += `${foot}${garis}\n\n`;
    }
  }

  menuText += `${Obrack} ${footer} ${Cbrack}`;
  return menuText;
}