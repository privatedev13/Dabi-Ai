export default {
  name: 'Cek kekuatan',
  command: ['cekkekuatan', 'cekkuat'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa kuat orang',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { cekkekuatan } = await global.loadFunctions();
      const { chatId, senderId, isGroup } = chatInfo;
      let targetId = target(msg, senderId);
      const mentionTarget = targetId;
      const cek = cekkekuatan[Math.floor(Math.random() * cekkekuatan.length)];

      const teks = `Nama: @${mentionTarget}\nKekuatan: ${cek}`

      await conn.sendMessage(chatId, {
        text: teks,
        mentions: [`${targetId}@s.whatsapp.net`]
      }, { quoted: msg });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(msg.key.remoteJid, {
        text: `Error: ${error.message || error}`
      }, { quoted: msg });
    }
  }
}