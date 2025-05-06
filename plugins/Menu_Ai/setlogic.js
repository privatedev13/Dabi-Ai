const fs = require('fs');
const configPath = './toolkit/set/config.json';

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
  name: 'setlogic',
  command: ['setlogic'],
  tags: 'Ai Menu',
  desc: 'Menyetel/menseting logika AI',

  isOwner: true,

  run: async (conn, message, { isPrefix }) => {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (args.length === 0) {
      const config = getConfig();
      const botName = config.botSetting.botName || 'Bot';
      const currentLogic = config.botSetting.logic || 'Belum disetel.';

      return conn.sendMessage(chatId, {
        text: `⚙️ Gunakan perintah:\n${prefix}setlogic [teks logika]\n\n📌 Contoh:\n${prefix}setlogic Ini adalah logika baru.\n\n*Logika saat ini (${botName}):*\n${currentLogic}`
      }, { quoted: message });
    }

    const newLogic = args.join(" ");

    try {
      let config = getConfig();
      config.botSetting.logic = newLogic;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(chatId, { text: `✅ Logika AI berhasil diubah menjadi:\n\n"${newLogic}"` }, { quoted: message });
    } catch (error) {
      conn.sendMessage(chatId, { text: "⚠️ Terjadi kesalahan saat menyimpan pengaturan!" }, { quoted: message });
    }
  }
};