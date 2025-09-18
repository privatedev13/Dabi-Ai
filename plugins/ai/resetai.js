import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionPath = path.join(__dirname, '../../temp/AiSesion.json');

export default {
  name: 'resetai',
  command: ['resetaichat', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset sesi AI',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args,
    prefix,
    commandText
  }) => {
    try {
      const { senderId, chatId } = chatInfo;
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

      const filterSystemOnly = (arr) => {
        return arr.filter(item => item.role === 'system' && item.content.trim() !== '');
      };

      if (commandText === 'resetai' && args[0] === 'all') {
        for (let key in session) {
          session[key] = filterSystemOnly(session[key]);
        }
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
        return conn.sendMessage(chatId, {
          text: `Sesi AI semua pengguna berhasil direset.`
        }, { quoted: msg });
      }

      if (commandText === 'resetaichat') {
        if (!session[senderId]) {
          return conn.sendMessage(chatId, {
            text: 'Tidak ada sesi AI yang ditemukan untuk kamu.'
          }, { quoted: msg });
        }

        session[senderId] = filterSystemOnly(session[senderId]);
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
        return conn.sendMessage(chatId, {
          text: 'Sesi AI kamu berhasil direset.'
        }, { quoted: msg });
      }

      return conn.sendMessage(chatId, {
        text: `Gunakan format:\n• ${prefix}resetaichat\n• ${prefix}resetai all`
      }, { quoted: msg });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatInfo.chatId, {
        text: 'Terjadi kesalahan saat mereset sesi AI.'
      }, { quoted: msg });
    }
  }
};