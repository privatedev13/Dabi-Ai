module.exports = {
  name: 'Cek wibu',
  command: ['cekwibu', 'cek wibu'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa wibu orang',

  isPremium: false,
  isOwner: false,

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!(await onlyPremium(module.exports, conn, message))) return;

      if (!(await onlyOwner(module.exports, conn, message))) return;

      const targetId = target(message, senderId);
      const mentionTarget = targetId;

      const persentase = Math.floor(Math.random() * 101);
      let komentar;
      if (persentase <= 25) {
        komentar = 'Masih aman tapi karbit';
      } else if (persentase <= 44) {
        komentar = 'Lumayan lah bukan fomo';
      } else if (persentase <= 72) {
        komentar = 'Kalo ini sih gangguan jiwa';
      } else if (persentase <= 88) {
        komentar = 'Fiks wibu bau bawang';
      } else {
        komentar = 'Aduh udah gila ini mah';
      }

      const teks = `Seberapa wibu @${mentionTarget}\n\n*${persentase}%* Wibu\n_${komentar}_`;

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