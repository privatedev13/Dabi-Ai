const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'listowner',
  command: ['listowner', 'lsow'],
  tags: 'Info Menu',
  desc: 'Melihat daftar owner',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args[0]?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!(await onlyOwner(module.exports, conn, message))) return;

    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: message });
    }

    const owners = config.ownerSetting.ownerNumber;
    if (owners.length === 0) {
      return conn.sendMessage(chatId, { text: 'Tidak ada owner yang terdaftar' }, { quoted: message });
    }

    let listText = `${head} ${Obrack} *DAFTAR OWNER* ${Cbrack}\n`;
    owners.forEach((num, i) => {
      listText += `${body} ${btn} ${i + 1}. ${num}\n`;
    });
    listText += `${foot}${garis}\n`;

    conn.sendMessage(chatId, { text: listText }, { quoted: message });
  }
};