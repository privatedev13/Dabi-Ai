const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'addowner',
  command: ['addowner', 'adow'],
  tags: 'Owner Menu',
  desc: 'Menambah owner bot',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

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

    if (!args[1]) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor yang akan dijadikan owner' }, { quoted: message });
    }

    let number = args[1].replace(/\D/g, '');
    if (!number.startsWith('62')) number = '62' + number;

    if (config.ownerSetting.ownerNumber.includes(number)) {
      return conn.sendMessage(chatId, { text: 'Nomor sudah terdaftar' }, { quoted: message });
    }

    config.ownerSetting.ownerNumber.push(number);

    try {
      const fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      conn.sendMessage(chatId, { text: `Nomor ${number} sudah ditambahkan sebagai owner` }, { quoted: message });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};