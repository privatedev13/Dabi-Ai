const { cekKhodam } = require('../../toolkit/function.js');

module.exports = {
  name: 'CekKhodam',
  command: ['cekkodam', 'cekkhodam'],
  tags: 'Fun Menu',
  desc: '',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : message.key.remoteJid;
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      let targetId = target(message, senderId);

      const mentionTarget = targetId;

      const cek = cekKhodam[Math.floor(Math.random() * cekKhodam.length)];

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

      const teks = `_Pengecekan Khodam untuk @${mentionTarget}⁩ telah berhasil_!\n\nSetelah melalui penelusuran spiritual yang mendalam, diketahui bahwa Khodam yang mendampingi @${mentionTarget} adalah *${cek}*`;

      const teks2 = `Bentar tak terawang dulu...`;

      conn.sendMessage(chatId, {
        text: teks2,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });

      await delay(3000);
      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: message });

    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  }
}