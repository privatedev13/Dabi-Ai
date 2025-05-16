const fs = require('fs');
const path = require("path");
const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

module.exports = {
  name: 'antilink',
  command: ['antilink'],
  tags: 'Group Menu',
  desc: 'Fitur anti link grup',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '❌ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const db = readDB();
    const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
    if (!groupData) {
      return conn.sendMessage(chatId, { text: "❌ Grup belum terdaftar di database.\nGunakan perintah *.daftargc* untuk mendaftar." }, { quoted: message });
    }

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);

    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Kamu bukan Admin!' }, { quoted: message });
    }

    if (!botAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Bot bukan admin' }, { quoted: message });
    }

    if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
      return conn.sendMessage(chatId, {
        text: `Penggunaan: ${prefix}${commandText} <on/off>`
      }, { quoted: message });
    }

    groupData.gbFilter = groupData.gbFilter || {};
    groupData.gbFilter.link.antilink = args[0].toLowerCase() === 'on';

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return conn.sendMessage(chatId, {
      text: `✅ Fitur antilink berhasil di-${args[0].toLowerCase() === 'on' ? 'aktifkan' : 'nonaktifkan'}.`
    }, { quoted: message });
  }
};