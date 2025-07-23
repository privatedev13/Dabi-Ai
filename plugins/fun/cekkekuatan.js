module.exports = {
  name: 'Cek kekuatan',
  command: ['cekkekuatan', 'cekkuat'],
  tags: 'Fun Menu',
  desc: 'Mengecek seberapa kuat orang',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { cekKuat } = await global.loadFunc();
      const { chatId, senderId, isGroup } = chatInfo;
      let targetId = target(msg, senderId);
      const mentionTarget = targetId;
      const cek = cekKuat[Math.floor(Math.random() * cekKuat.length)];

      const teks = `Nama: @${mentionTarget}\nKekuatan: ${cek}`

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