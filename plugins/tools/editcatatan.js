import fs from 'fs';
import path from 'path';

const catatanPath = path.join(getDirname(import.meta.url), '../../toolkit/db/catatan.json');

export default {
  name: 'editcatat',
  command: ['catat'],
  tags: 'Tools Menu',
  desc: 'Menambahkan isi ke dalam nama catatan',
  prefix: true,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    args
  }) => {
    try {
      const { chatId } = chatInfo;
      const catatan = fs.existsSync(catatanPath)
        ? JSON.parse(fs.readFileSync(catatanPath))
        : {};

      if (!args[0])
        return conn.sendMessage(chatId, { text: `Contoh: ${prefix}catat NamaCatatan TeksCatatan` }, { quoted: msg });

      const nama = args.shift();
      if (!catatan[nama])
        return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: msg });

      const isiCatatan =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
        args.join(' ') ||
        null;

      if (!isiCatatan)
        return conn.sendMessage(chatId, { text: 'Teks catatan tidak boleh kosong.' }, { quoted: msg });

      catatan[nama][`catatan${Object.keys(catatan[nama]).length + 1}`] = isiCatatan;
      fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));

      conn.sendMessage(chatId, { text: `Berhasil menambahkan isi ke *${nama}*.` }, { quoted: msg });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(chatInfo.chatId, { text: `Error: ${error}`, quoted: msg });
    }
  }
};