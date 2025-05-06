module.exports = {
  name: 'ceksigma',
  command: ['ceksigma'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa sigma seseorang',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    let targetId = target(message, senderId);
    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih cupu';
    } else if (persentase <= 44) {
      komentar = 'Lumayan alpha';
    } else if (persentase <= 72) {
      komentar = 'Wih calon sigma!';
    } else if (persentase <= 88) {
      komentar = 'Sigma sejati!';
    } else {
      komentar = 'Hati² Alpha Overlord!';
    }

    const mentionTarget = targetId;

    const teks = `Cek seberapa sigma @${mentionTarget}\n\n${persentase}% Sigma\n_${komentar}_`;

    conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });
  }
};