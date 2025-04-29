module.exports = {
  name: 'cekpinter',
  command: ['cekpinter', 'cekpintar', 'cekkepintaran'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa pinter orang',

  isOwner: false,
  isPremium: false,

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

      if (!(await onlyOwner(module.exports, conn, message))) return;
      if (!(await onlyPremium(module.exports, conn, message))) return;

      let targetId = target(message, senderId);
      const mentionTarget = targetId;

      const persentase = Math.floor(Math.random() * 101);
      let komentar;
      if (persentase <= 25) {
        komentar = 'Gak tolol² amat lah';
      } else if (persentase <= 44) {
        komentar = 'Masih mending';
      } else if (persentase <= 72) {
        komentar = 'Pinter juga lu';
      } else if (persentase <= 88) {
        komentar = 'Tumben pinter';
      } else {
        komentar = 'Orang c*na sih ini!';
      }

      const teks = `*Seberapa pintar @${mentionTarget}*\n\n*${persentase}%* pintar\n_${komentar}_`;

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