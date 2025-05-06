module.exports = {
  name: 'cekcantik',
  command: ['cekcantik'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa cantik seseorang',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    let targetId = target(message, senderId);

    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih biasa aja';
    } else if (persentase <= 44) {
      komentar = 'Lumayan lah';
    } else if (persentase <= 72) {
      komentar = 'Cantik juga kamu';
    } else if (persentase <= 88) {
      komentar = 'Wah cantik banget';
    } else {
      komentar = 'Calon Miss Universe!';
    }

    const mentionTarget = targetId;

    const teks = `*Seberapa cantik @${mentionTarget}*\n\n*${persentase}%* Cantik\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });
  }
};