let autoAI = global.autoAI || {};
const fetch = require('node-fetch');
const fs = require('fs');

module.exports = {
  name: 'autoAI',
  command: ['ai'],
  tags: 'Ai Menu',
  desc: 'Aktifkan atau nonaktifkan fitur auto AI di chat',

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    const isCmd = args[0]?.toLowerCase();
    if (!isCmd) {
      return conn.sendMessage(chatId, { 
        text: `Contoh penggunaan:\n\n${prefix}${commandText} on\n${prefix}${commandText} off` 
      }, { quoted: message });
    }

    if (isCmd === 'on') {
      autoAI[chatId] = true;
      global.autoAI = autoAI;
      return conn.sendMessage(chatId, { 
        text: 'Auto AI diaktifkan di chat ini.' 
      }, { quoted: message });
    } else if (isCmd === 'off') {
      autoAI[chatId] = false;
      global.autoAI = autoAI;
      return conn.sendMessage(chatId, { 
        text: 'Auto AI dinonaktifkan di chat ini.' 
      }, { quoted: message });
    } else {
      return conn.sendMessage(chatId, { 
        text: 'Pilihan tidak dikenal! Gunakan `on` atau `off`.' 
      }, { quoted: message });
    }
  },

  before: async (conn, message) => {
    const chatId = message?.key?.remoteJid;
    const m = message;
    const msg = m.message || {};
    const exp = conn.user?.id;

    const isMention = msg?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(exp);
    const isReply = msg?.extendedTextMessage?.contextInfo?.participant === exp;

    if (!autoAI[chatId]) return;
    if (!(isMention || isReply)) return;

    const setting = JSON.parse(fs.readFileSync('./toolkit/set/config.json'));
    const offline = setting?.offline?.status;

    const body = 
      m.body ||
      msg?.conversation ||
      msg?.extendedTextMessage?.text;

    if (!body) return;

    const context = offline
      ? `Kamu sedang berbicara dengan AI karena pemilik sedang tidak aktif. Jawab dengan sopan dan profesional.`
      : `Balas sebaik mungkin sesuai konteks pesan.`;

    try {
      const res = await fetch(`https://apizell.web.id/ai/custom?text=${encodeURIComponent(body)}&logic=${encodeURIComponent(context)}`);
      const data = await res.json();

      if (data?.result) {
        await conn.sendMessage(chatId, {
          text: data.result,
          quoted: m
        });
      }
    } catch (e) {
      console.error(e);
      await conn.sendMessage(chatId, {
        text: 'Terjadi kesalahan saat mengakses AI.',
        quoted: m
      });
    }
  }
};