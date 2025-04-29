module.exports = {
  name: 'cek mesum',
  command: ['cekmesum'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa mesum orang',

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

      const persentase = Math.floor(Math.random() * 101);

      let komentar;
      if (persentase <= 25) {
        komentar = 'Masih mending';
      } else if (persentase <= 44) {
        komentar = 'Waduh ini sih udah';
      } else if (persentase <= 72) {
        komentar = 'Parah sih ini';
      } else if (persentase <= 88) {
        komentar = 'Cabul bet';
      } else {
        komentar = 'Hati-hati orang cabul';
      }

      const teks = `*seberapa cabul @${mentionTarget}*\n\n*${persentase}%* Cabul\n_${komentar}_`

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