import fs from 'fs';
import path from 'path';
import https from 'https';
import { fork } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';

console.log('Starting...\n');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const licensePath = path.join(__dirname, 'LICENSE');

if (fs.existsSync(licensePath)) {
  console.log(fs.readFileSync(licensePath, 'utf8') + '\n');
} else {
  console.log('LICENSE tidak ditemukan.');
  setInterval(() => {}, 1000);
}

['session', 'temp'].forEach(d => {
  const dir = path.join(__dirname, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const downloadAndSave = (url, dest) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(dest);
  https.get(url, res => {
    if (res.statusCode !== 200) return reject(new Error(`Status code: ${res.statusCode}`));
    res.pipe(file).on('finish', () => file.close(resolve));
  }).on('error', err => {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    reject(err);
  });
});

const start = () => {
  const child = fork(path.join(__dirname, 'main.js'), process.argv.slice(2), { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
  child.on('message', msg => {
    if (msg === 'reset') {
      console.log('Restarting...');
      child.kill();
    } else if (msg === 'uptime') {
      child.send(process.uptime());
    }
  });
  child.on('exit', code => {
    console.log('Exited with code:', code);
    start();
  });
};

const remoteURL = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/setCfg.js';
const localFile = path.join(__dirname, 'session', 'setCfg.js');

downloadAndSave(remoteURL, localFile)
  .then(() => import(pathToFileURL(localFile).href).then(start))
  .catch(err => {
    console.error('Gagal memuat kode remote:', err);
    console.error('Tidak menjalankan start().');
  });