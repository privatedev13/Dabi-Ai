module.exports = {
  name: 'cekjomok',
  command: ['cekjomok', 'cekgay'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa jomok seseorang',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    let targetId = target(message, senderId);

    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih aman lu bang';
    } else if (persentase <= 44) {
      komentar = 'Agak lain lu bang';
    } else if (persentase <= 72) {
      komentar = 'Waduh warga sungut lele';
    } else if (persentase <= 88) {
      komentar = 'Fiks jomok';
    } else {
      komentar = 'Hati² orang jomok';
    }

    const mentionTarget = targetId;

    const teks = `*Cek seberapa jomok @${mentionTarget}*\n\n*${persentase}%* Jomok\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });
  }
};