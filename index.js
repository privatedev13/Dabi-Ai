console.log('Starting...\n');

const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const https = require('https');

const licensePath = path.join(__dirname, 'LICENSE');
if (!fs.existsSync(licensePath)) {
  console.log('LICENSE tidak ditemukan.\nJangan hapus file ini!');
  return setInterval(() => {}, 1000);
}
console.log('··───── LICENSE ─────··\n\n' + fs.readFileSync(licensePath, 'utf8') + '\n\n··───────────··\n');

const tempDir = path.join(__dirname, 'temp');
fs.existsSync(tempDir) || fs.mkdirSync(tempDir);

const downloadAndSave = (url, dest) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(dest);
  https.get(url, (res) => {
    if (res.statusCode !== 200) return reject(new Error(`Status code: ${res.statusCode}`));
    res.pipe(file).on('finish', () => file.close(resolve));
  }).on('error', (err) => {
    fs.existsSync(dest) && fs.unlinkSync(dest);
    reject(err);
  });
});

const start = () => {
  const child = fork(path.join(__dirname, 'main.js'), process.argv.slice(2), { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });

  child.on('message', (msg) => {
    if (msg === 'reset') {
      console.log('Restarting...');
      child.kill();
    } else if (msg === 'uptime') {
      child.send(process.uptime());
    }
  });

  child.on('exit', (code) => {
    console.log('Exited with code:', code);
    start();
  });
};

const remoteURL = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/prgM.js';
const localFile = path.join(tempDir, 'prgM.js');

downloadAndSave(remoteURL, localFile)
  .then(() => {
    require(localFile);
    start();
  })
  .catch((err) => {
    console.error('Gagal memuat kode remote:', err);
    console.error('Tidak menjalankan start().');
  });