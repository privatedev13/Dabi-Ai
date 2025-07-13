const fetch = require("node-fetch");

module.exports = {
  name: 'elevenlabs',
  command: ['elevenlabs'],
  tags: 'Fun Menu',
  desc: 'Text to Speech ElevenLabs VN',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId } = chatInfo;

    const voiceList = [
      'prabowo',
      'yanzgpt',
      'bella',
      'megawati',
      'echilling',
      'adam',
      'thomas_shelby',
      'michi_jkt48',
      'nokotan',
      'jokowi',
      'boboiboy',
      'keqing',
      'anya',
      'yanami_anna',
      'MasKhanID',
      'Myka',
      'raiden',
      'CelzoID'
    ];

    if (args.length < 2) {
      const voiceListText = voiceList.map(name => `- *${name}*`).join('\n');
      return conn.sendMessage(chatId, {
        text: `🚨 *Format salah!*\n\nGunakan: *${prefix}${commandText} <voice> <text>*\n\n📢 *Daftar Voice Tersedia:*\n${voiceListText}`
      }, { quoted: msg });
    }

    const [voiceRaw, ...textParts] = args;
    const voice = voiceRaw.toLowerCase();
    const text = textParts.join(' ');

    const matchedVoice = voiceList.find(v => v.toLowerCase() === voice);
    if (!matchedVoice) {
      return conn.sendMessage(chatId, {
        text: `❌ *Voice tidak dikenal!*\nKetik *${prefix}${commandText}* untuk melihat daftar voice yang tersedia.`
      }, { quoted: msg });
    }

    try {
      const pitch = 0;
      const speed = 0.9;

      const url = `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${matchedVoice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const audioBuffer = await response.arrayBuffer();
      const audioMessage = Buffer.from(audioBuffer);

      await conn.sendMessage(chatId, {
        audio: audioMessage,
        mimetype: 'audio/mp4',
        ptt: true
      }, { quoted: msg });
    } catch (error) {
      console.error(error);
      return conn.sendMessage(chatId, {
        text: `⚠️ *Gagal membuat suara!*`
      }, { quoted: msg });
    }
  }
};