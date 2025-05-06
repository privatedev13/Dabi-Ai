const { chatGpt4 } = require('../../toolkit/scrape/gpt4');

module.exports = {
  name: 'gpt4o',
  command: ['gpt4o'],
  tags: 'Ai Menu',
  description: 'Tanya ke GPT-4o menggunakan ChatGPT4o.one',
  
  run: async (conn, message, { isPrefix }) => {
    try {
      const parsed = parseMessage(message, isPrefix);
      if (!parsed) return;

      const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

      if (!module.exports.command.includes(commandText)) return;

      if (!text) {
        return conn.sendMessage(chatId, { text: '❌ Apa yang ingin kamu tanyakan?' }, { quoted: message });
      }

      const response = await chatGpt4(text);
      if (!response) {
        return conn.sendMessage(chatId, { text: '❌ Gagal mendapatkan respon.' }, { quoted: message });
      }

      conn.sendMessage(chatId, { text: response.data || response.message || '❌ Tidak ada respon.' }, { quoted: message });

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: '❌ Terjadi kesalahan saat memproses permintaan.' }, { quoted: message });
    }
  }
};