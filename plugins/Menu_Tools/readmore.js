module.exports = {
  name: 'readmore',
  command: ['rd', 'readmore'],
  tags: 'Tools Menu',
  desc: 'Membuat teks read more (lihat selengkapnya) untuk menyembunyikan bagian teks.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : message.key.remoteJid;
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const fullText = args.join(' ');
      if (!fullText.includes('|')) {
        return conn.sendMessage(chatId, {
          text: `Format salah!\nGunakan: *${prefix}${commandText} text1 | text2*\nContoh: *${prefix}${commandText} halo | semuanya*`
        }, { quoted: message });
      }

      const [text1, text2] = fullText.split('|').map(v => v.trim());
      const more = String.fromCharCode(8206);
      const readmore = more.repeat(4001);

      const result = `${text1} ${readmore} ${text2}`;
      await conn.sendMessage(chatId, { text: result }, { quoted: message });

    } catch (e) {
      console.error('Error in readmore command:', e);
      conn.sendMessage(message.key.remoteJid, {
        text: 'Terjadi kesalahan saat memproses perintah.'
      }, { quoted: message });
    }
  }
};