import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: 'updateall',
  command: ['updateall'],
  tags: 'Owner Menu',
  desc: 'Perbarui seluruh script dari repository GitHub.',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    if (!args.length) {
      return conn.sendMessage(chatId, { 
        text: '⚠️ Contoh penggunaan:\n.updateall https://github.com/user/repo' 
      }, { quoted: msg });
    }

    const githubUrl = args[0];
    const tempDir = path.resolve(__dirname, '../../temp_repo');
    const baseDir = path.resolve(__dirname, '../../');
    const configPath = path.join(baseDir, 'toolkit/set/config.json');

    try {
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });

      await conn.sendMessage(chatId, { text: '📥 Mengkloning repository...' }, { quoted: msg });
      execSync(`git clone --depth=1 ${githubUrl} ${tempDir}`);

      const copyRecursive = (src, dest) => {
        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (srcPath === configPath) continue;
          entry.isDirectory()
            ? (fs.existsSync(destPath) || fs.mkdirSync(destPath), copyRecursive(srcPath, destPath))
            : fs.copyFileSync(srcPath, destPath);
        }
      };

      copyRecursive(tempDir, baseDir);
      fs.rmSync(tempDir, { recursive: true, force: true });

      await conn.sendMessage(chatId, { text: '✅ Semua file berhasil diperbarui dari GitHub.' }, { quoted: msg });
      await conn.sendMessage(chatId, { text: '♻️ Bot akan restart dalam 3 detik...' }, { quoted: msg });
      setTimeout(() => process.exit(1), 3000);

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat proses update.' }, { quoted: msg });
    }
  }
};