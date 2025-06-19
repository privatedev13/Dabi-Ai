module.exports = {
  name: 'cekjodoh',
  command: ['cekjodoh'],
  tags: 'Fun Menu',
  desc: 'Cek jodoh antara dua orang secara random.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });

    const groupMetadata = await mtData(chatId, conn);
    if (!groupMetadata) return conn.sendMessage(chatId, { text: 'Gagal mengambil metadata grup.' }, { quoted: msg });

    const participants = groupMetadata.participants.map(p => p.id).filter(id => id !== conn.user.id);

    let target1, target2;
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (mentionedJid.length >= 2) {
      target1 = mentionedJid[0];
      target2 = mentionedJid[1];
    } else if (mentionedJid.length === 1) {
      target1 = mentionedJid[0];
      target2 = participants[Math.floor(Math.random() * participants.length)];
    } else if (quotedParticipant) {
      target1 = quotedParticipant;
      target2 = participants[Math.floor(Math.random() * participants.length)];
    } else {
      target1 = participants[Math.floor(Math.random() * participants.length)];
      target2 = participants[Math.floor(Math.random() * participants.length)];
      while (target1 === target2) {
        target2 = participants[Math.floor(Math.random() * participants.length)];
      }
    }

    const persen = Math.floor(Math.random() * 100) + 1;

    await conn.sendMessage(chatId, {
      text: `*Cek Jodoh*\n@${target1.split('@')[0]} ❤️ @${target2.split('@')[0]}\n*${persen}%*`,
      mentions: [target1, target2]
    }, { quoted: msg });
  }
};