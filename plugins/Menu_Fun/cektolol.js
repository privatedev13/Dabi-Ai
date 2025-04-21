module.exports = {
  name: 'cektolol',
  command: ['cektolol'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa tolol seseorang',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;
    let targetId = target(message, senderId);

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

    const mentionTarget = targetId;

    const teks = `Cek seberapa tolol @${mentionTarget}\n\n${persentase}% Tolol\n_${komentar}_`;

    conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: message });
  }
};