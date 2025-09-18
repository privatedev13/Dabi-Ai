import axios from 'axios';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import fetchHentaivid from '../../toolkit/scrape/hentaivid.js';

const TMP = path.resolve('./temp');
if (!fs.existsSync(TMP)) console.log('Folder temp tidak ada');

export default {
  name: 'hentaivid',
  command: ['hentaivid'],
  tags: 'Nsfw Menu',
  desc: 'Mengambil video hentai random dari API',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    let file;
    try {
      const url = await fetchHentaivid();
      const res = await axios.get(url, { responseType: 'stream' });

      file = path.join(TMP, `hentaivid_${Date.now()}.mp4`);
      const writer = fs.createWriteStream(file);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await conn.sendMessage(chatId, { video: { url: file } }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg });
    } finally {
      if (file) {
        try {
          await fsp.unlink(file);
        } catch (err) {
          console.error('Gagal hapus file temp:', err);
        }
      }
    }
  }
};