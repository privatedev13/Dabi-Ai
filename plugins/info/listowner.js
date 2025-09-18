import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

export default {
  name: 'listowner',
  command: ['listowner', 'lsow'],
  tags: 'Info Menu',
  desc: 'Melihat daftar owner',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: msg });
    }

    const owners = config.ownerSetting?.ownerNumber || [];
    if (!owners.length) {
      return conn.sendMessage(chatId, { text: 'Tidak ada owner yang terdaftar' }, { quoted: msg });
    }

    let listText = `${head} ${Obrack} *DAFTAR OWNER* ${Cbrack}\n`;
    owners.forEach((num, i) => {
      listText += `${body} ${btn} ${i + 1}. ${num}\n`;
    });
    listText += `${foot}${garis}\n`;

    conn.sendMessage(chatId, { text: listText }, { quoted: msg });
  }
};