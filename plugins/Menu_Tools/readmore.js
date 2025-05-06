module.exports = {
  name: 'readmore',
  command: ['rd', 'readmore'],
  tags: 'Tools Menu',
  desc: 'Membuat teks read more (lihat selengkapnya) untuk menyembunyikan bagian teks.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

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