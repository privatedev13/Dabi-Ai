const { chatGpt4 } = require('../../toolkit/scrape/gpt4');

module.exports = {
  name: 'gpt4o',
  command: ['gpt4o'],
  tags: 'Ai Menu',
  description: 'Tanya ke GPT-4o menggunakan ChatGPT4o.one',
  
  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = message.key.participant || chatId.replace(/:\d+@/, '@');

      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      const text = args.join(' ');

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