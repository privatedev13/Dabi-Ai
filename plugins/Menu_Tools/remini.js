const remini = require('../../toolkit/scrape/remini');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'remini',
  command: ['remini'],
  tags: 'Tools Menu',
  desc: 'Meningkatkan kualitas gambar',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedImage = quotedMsg?.imageMessage;
      const directImage = msg.message?.imageMessage;

      const imageSource = quotedImage || directImage;

      if (!imageSource) {
        return conn.sendMessage(
          chatId,
          {
            text: `Kirim atau balas gambar dengan caption *${prefix}${commandText} [mode]*\n\nMode tersedia:\n- enhance\n- recolor\n- dehaze`
          },
          { quoted: msg }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage(
          { message: quotedImage ? quotedMsg : msg.message },
          'buffer',
          {}
        );
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          chatId,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: msg }
        );
      }

      await conn.sendMessage(chatId, { react: { text: '🕒', key: msg.key } });

      const mode = (args[0] || 'enhance').toLowerCase();
      let result;
      try {
        result = await remini(media, mode);
        if (!result) throw new Error('Gagal memproses gambar.');
      } catch (error) {
        return conn.sendMessage(
          chatId,
          { text: `❌ Gagal memproses gambar! ${error.message}` },
          { quoted: msg }
        );
      }

      await conn.sendMessage(
        chatId,
        {
          image: result,
          caption: `Berhasil! Mode: *${mode}*`
        },
        { quoted: msg }
      );
    } catch (error) {
      conn.sendMessage(
        chatInfo.chatId,
        { text: `❌ Terjadi kesalahan saat memproses gambar, coba lagi! ${error.message}` },
        { quoted: msg }
      );
      console.error('❌ Error pada plugin remini:', error);
    }
  }
};