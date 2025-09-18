import fs from 'fs';
import path from 'path';

export default {
  name: 'cleartemp',
  command: ['cleartemp', 'ctemp'],
  tags: 'Owner Menu',
  desc: 'Membersihkan folder temp',
  prefix: true,
  owner: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const tempDir = path.resolve('./temp');

    if (!fs.existsSync(tempDir))
      return conn.sendMessage(chatId, { text: '📂 Folder temp tidak ditemukan.' }, { quoted: msg });

    try {
      const files = fs.readdirSync(tempDir);
      if (!files.length)
        return conn.sendMessage(chatId, { text: '✅ Folder temp sudah bersih.' }, { quoted: msg });

      files.forEach(f => fs.rmSync(path.join(tempDir, f), { recursive: true, force: true }));
      return conn.sendMessage(chatId, { text: '✅ Semua file dalam folder temp berhasil dihapus.' }, { quoted: msg });
    } catch {
      return conn.sendMessage(chatId, { text: '❌ Gagal membersihkan folder temp.' }, { quoted: msg });
    }
  }
};