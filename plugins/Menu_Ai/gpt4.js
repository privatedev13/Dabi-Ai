const gpt4 = require('../../toolkit/scrape/gpt4');

module.exports = {
  name: 'gpt4o',
  command: ['gpt4o', 'gpt4'],
  tags: 'Ai Menu',
  desc: 'Tanya ke GPT-4o menggunakan ChatGPT4o.one',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    if (!(await isPrem(module.exports, conn, msg))) return;
    try {
      const { chatId } = chatInfo;
      if (!textMessage) {
        return conn.sendMessage(chatId, { text: '❌ Apa yang ingin kamu tanyakan?' }, { quoted: msg });
      }

      const response = await gpt4(textMessage);
      if (!response) {
        return conn.sendMessage(chatId, { text: '❌ Gagal mendapatkan respon.' }, { quoted: msg });
      }

      conn.sendMessage(chatId, { text: response }, { quoted: msg });

    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan saat memproses permintaan.' }, { quoted: msg });
    }
  }
};