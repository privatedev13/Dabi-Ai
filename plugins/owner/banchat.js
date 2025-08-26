const fs = require('fs');

module.exports = {
  name: 'banchat',
  command: ['banned', 'ban'],
  tags: 'Owner Menu',
  desc: 'Ban user dengan menambahkan ban: true di database',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo;
    if (!(await isOwner(module.exports, conn, msg))) return;

    try {
      if (!args[0] && !msg.message?.extendedTextMessage?.contextInfo)
        return conn.sendMessage(chatId, { text: 'Reply/tag atau tulis nomor untuk dibanned' }, { quoted: msg });

      const nomorTarget = args[0] ? await calNumber(args[0]) : await calNumber(target(msg, senderId));
      const dbData = getDB();
      let found = false;

      for (const key in dbData.Private) {
        if (dbData.Private[key].Nomor.replace(/@s\.whatsapp\.net$/i, '') === nomorTarget) {
          dbData.Private[key].ban = true;
          found = true;
          break;
        }
      }

      if (!found)
        return conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan di database' }, { quoted: msg });

      saveDB();
      conn.sendMessage(chatId, { text: `Berhasil banned nomor: +${nomorTarget}` }, { quoted: msg });
    } catch (e) {
      console.error(e);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses banned' }, { quoted: msg });
    }
  }
};