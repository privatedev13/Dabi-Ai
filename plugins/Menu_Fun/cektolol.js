module.exports = {
  name: 'cektolol',
  command: ['cektolol'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa tolol seseorang',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    let targetId = target(message, senderId);
    const mentionTarget = targetId;

    const persentase = Math.floor(Math.random() * 101);

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih pinter kok';
    } else if (persentase <= 44) {
      komentar = 'Agak bego dikit';
    } else if (persentase <= 72) {
      komentar = 'Aduh tolol nih';
    } else if (persentase <= 88) {
      komentar = 'Fix goblok';
    } else {
      komentar = 'Hati² idiot tingkat dewa';
    }

    const teks = `Cek seberapa tolol @${mentionTarget}\n\n${persentase}% Tolol\n_${komentar}_`;

    conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });
  }
};