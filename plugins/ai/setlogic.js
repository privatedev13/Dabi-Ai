import fs from 'fs';
const configPath = './toolkit/set/config.json';
const aiSessionPath = './session/AiSesion.json';

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export default {
  name: 'setlogic',
  command: ['setlogic', 'set'],
  tags: 'Ai Menu',
  desc: 'Menyetel/menseting logika AI',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (args.length === 0) {
      const config = getConfig();
      const botName = config.botSetting.botName || 'Bot';
      const currentLogic = config.botSetting.logic || 'Belum disetel.';

      return conn.sendMessage(chatId, {
        text: `⚙️ Gunakan perintah:\n${prefix}${commandText} [teks logika]\n\n📌 Contoh:\n${prefix}${commandText} Ini adalah logika baru.\n\n*Logika saat ini [ ${botName} ]:*\n${currentLogic}`
      }, { quoted: msg });
    }

    const newLogic = args.join(" ");

    try {
      let config = getConfig();
      config.botSetting.logic = newLogic;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      if (fs.existsSync(aiSessionPath)) {
        fs.writeFileSync(aiSessionPath, JSON.stringify({}));
      }

      conn.sendMessage(chatId, { text: `✅ Logika AI berhasil diubah menjadi:\n\n"${newLogic}"` }, { quoted: msg });
    } catch (error) {
      conn.sendMessage(chatId, { text: "⚠️ Terjadi kesalahan saat menyimpan pengaturan!" }, { quoted: msg });
    }
  }
};