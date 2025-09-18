import fetch from 'node-fetch';

export default {
  name: 'reset-ai-bell',
  command: ['resetbell', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset sesi AI Bell untuk user',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;
    try {
      const targetId = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || msg.message?.extendedTextMessage?.contextInfo?.participant
        || senderId;
      const res = await fetch(`${termaiWeb}/api/chat/logic-bell/reset?id=${targetId}&key=${termaiKey}`);
      const json = await res.json();
      await conn.sendMessage(chatId, { text: json.msg || 'Gagal mereset AI Bell' }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Terjadi kesalahan: ${e.message}` }, { quoted: msg });
    }
  }
};