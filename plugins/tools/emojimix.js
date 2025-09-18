import axios from 'axios';
import { convertToWebp, sendImageAsSticker } from '../../toolkit/exif.js';

export default {
  name: 'emojimix',
  command: ['emojimix', 'mix'],
  tags: 'Tools Menu',
  desc: 'Gabungkan dua emoji dan kirim sebagai stiker',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    const { chatId } = chatInfo;

    if (args.length < 2) {
      return conn.sendMessage(chatId, {
        text: `Contoh penggunaan:\n${prefix}${commandText} 😹 😎`
      }, { quoted: msg });
    }

    try {
      const emoji1 = encodeURIComponent(args[0]);
      const emoji2 = encodeURIComponent(args[1]);
      const apiUrl = `https://api.ureshii.my.id/api/tools/emojimix?emoji1=${emoji1}&emoji2=${emoji2}`;

      const res = await axios.get(apiUrl);
      const { status, data } = res.data;

      if (!status || !data) {
        return conn.sendMessage(chatId, {
          text: 'Gagal menggabungkan emoji. Coba gunakan kombinasi emoji yang lain.'
        }, { quoted: msg });
      }

      const imageBuffer = (await axios.get(data, { responseType: 'arraybuffer' })).data;
      const webpBuffer = await convertToWebp(imageBuffer);

      await sendImageAsSticker(conn, chatId, webpBuffer, msg);

    } catch (err) {
      console.error('Error emojimix:', err);
      conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat memproses permintaan.'
      }, { quoted: msg });
    }
  }
};