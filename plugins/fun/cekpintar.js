export default {
  name: 'cekpinter',
  command: ['cekpinter', 'cekpintar', 'cekkepintaran'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa pinter orang',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      let targetId = target(msg, senderId);
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

      const teks = `*Seberapa pintar* @${mentionTarget}\n\n*${persentase}%* pintar\n_${komentar}_`;

      await conn.sendMessage(chatId, {
      text: teks,
      mentions: [`${targetId}@s.whatsapp.net`]
    }, { quoted: msg });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: msg,
      });
    }
  }
}