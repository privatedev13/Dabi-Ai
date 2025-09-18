import pixiv from '../../toolkit/scrape/pixiv.js';

export default {
  name: 'pixiv',
  command: ['pixiv'],
  tags: 'Nsfw Menu',
  desc: 'Mencari dan mengunduh ilustrasi dari Pixiv',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    textMessage,
    args
  }) => {
    const { chatId } = chatInfo
    try {
      if (!args[0]) {
        return conn.sendMessage(chatId, { text: `Gunakan: ${prefix + commandText} <nama karakter> [r18]` }, { quoted: msg })
      }

      const r18 = args.includes('r18')
      const characterName = args.filter(a => a.toLowerCase() !== 'r18').join(' ')
      const result = await pixiv(characterName, r18)

      if (!result) {
        return conn.sendMessage(chatId, { text: `Tidak ditemukan hasil untuk "${characterName}"` }, { quoted: msg })
      }

      await conn.sendMessage(chatId, {
        image: result.buffer,
        caption: result.caption
      }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil data dari Pixiv.' }, { quoted: msg })
      console.error(e)
    }
  }
}