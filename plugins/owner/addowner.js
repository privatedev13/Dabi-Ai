import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

export default {
  name: 'addowner',
  command: ['addowner', 'adow'],
  tags: 'Owner Menu',
  desc: 'Menambah owner bot',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: msg });
    }

    const rawInput = args.join(' ');
    if (!rawInput) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor yang akan dijadikan owner' }, { quoted: msg });
    }

    const number = await normalizeNumber(rawInput);
    if (config.ownerSetting.ownerNumber.includes(number)) {
      return conn.sendMessage(chatId, { text: 'Nomor sudah terdaftar' }, { quoted: msg });
    }

    config.ownerSetting.ownerNumber.push(number);

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      conn.sendMessage(chatId, { text: `Nomor ${number} sudah ditambahkan sebagai owner` }, { quoted: msg });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: msg });
    }
  }
};