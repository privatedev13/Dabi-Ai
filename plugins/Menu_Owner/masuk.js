const { isJidGroup } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'masuk',
  command: ['masuk', 'gabung'],
  tags: 'Owner Menu',
  desc: 'Menambahkan bot ke group',
  prefix: true,
  isPremium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    let text = args.join(' ');
    if (!text && msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
      text = quoted.conversation || quoted.extendedTextMessage?.text || '';
    }

    if (!text) {
      return conn.sendMessage(chatId, {
        text: '⚠️ Harap berikan tautan grup WhatsApp atau reply pesan yang berisi tautan.'
      }, { quoted: msg });
    }

    const linkRegex = /chat\.whatsapp\.com\/([\w\d]+)/;
    const match = text.match(linkRegex);
    if (!match) {
      return conn.sendMessage(chatId, {
        text: '❌ Format tautan grup tidak valid.'
      }, { quoted: msg });
    }

    const code = match[1];

    try {
      const res = await conn.groupAcceptInvite(code);
      if (res && isJidGroup(res)) {
        return conn.sendMessage(chatId, {
          text: `✅ Berhasil bergabung ke grup!\n\n📌 ID Grup: ${res}`
        }, { quoted: msg });
      } else {
        return conn.sendMessage(chatId, {
          text: '✅ Berhasil... Menunggu persetujuan admin.'
        }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('rejected') || err.message.includes('kicked')) {
        return conn.sendMessage(chatId, {
          text: '✖️ Gagal memasuki grup, karena bot pernah dikeluarkan.'
        }, { quoted: msg });
      }
      return conn.sendMessage(chatId, {
        text: '❌ Gagal bergabung ke grup. Pastikan bot tidak dibatasi untuk masuk ke grup.'
      }, { quoted: msg });
    }
  }
};