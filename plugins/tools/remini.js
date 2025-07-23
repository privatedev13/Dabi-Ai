const remini = require('../../toolkit/scrape/remini');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'remini',
  command: ['remini'],
  tags: 'Tools Menu',
  desc: 'Upscale kualitas gambar (scale 2-4)',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedImage = quotedMsg?.imageMessage;
      const directImage = msg.message?.imageMessage;

      const imageSource = quotedImage || directImage;

      if (!imageSource) {
        return conn.sendMessage(
          chatId,
          {
            text: `Kirim atau balas gambar dengan caption *${prefix}${commandText} [scale]*\n\nContoh:\n${prefix}${commandText} 4\n\nNilai scale bisa 2, 3, atau 4.`
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

      const scale = parseInt(args[0]) || 4;
      if (![2, 3, 4].includes(scale)) {
        return conn.sendMessage(
          chatId,
          { text: '❌ Nilai scale harus 2, 3, atau 4!' },
          { quoted: msg }
        );
      }

      let result;
      try {
        result = await remini(media, scale);
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
          caption: `✅ Gambar berhasil di-upscale!\nSkala: *${scale}x*`
        },
        { quoted: msg }
      );
    } catch (error) {
      conn.sendMessage(
        chatInfo.chatId,
        { text: `❌ Terjadi kesalahan saat memproses gambar: ${error.message}` },
        { quoted: msg }
      );
      console.error('❌ Error pada plugin remini:', error);
    }
  }
};