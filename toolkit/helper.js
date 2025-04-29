const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

const dbFolder = path.join(__dirname, '../toolkit/db');
const dbFile = path.join(dbFolder, 'database.json');

const initializeDatabase = () => {
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
    console.log('✅ Folder database dibuat:', dbFolder);
  }

  if (!fs.existsSync(dbFile)) {
    const initialData = { Private: {}, Grup: {} };
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
    console.log('✅ File database dibuat:', dbFile);
  }
};

const readDB = () => {
  try {
    let data = fs.readFileSync(dbFile, 'utf-8');
    return data ? JSON.parse(data) : { Private: {}, Grup: {} };
  } catch (error) {
    console.error('❌ Error membaca database:', error);
    return { Private: {}, Grup: {} };
  }
};

const saveDB = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

const getWelcomeStatus = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);
  return groupData?.Welcome?.welcome || false;
};

const getWelcomeText = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);
  return groupData?.Welcome?.welcomeText || "👋 Selamat datang @user di grup!";
};

const setWelcomeSettings = (chatId, groupName, status, text) => {
  let db = readDB();
  db.Grup = db.Grup || {};

  db.Grup[groupName] = db.Grup[groupName] || { Id: chatId, Welcome: { welcome: false, welcomeText: "" } };

  db.Grup[groupName].Welcome.welcome = status;
  if (text) db.Grup[groupName].Welcome.welcomeText = text;

  saveDB(db);
};

const getLeftStatus = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);
  return groupData?.Left?.gcLeft || false;
};

const getLeftText = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);
  return groupData?.Left?.leftText || "👋 Selamat tinggal @user!";
};

const setLeftSettings = (chatId, groupName, status, text) => {
  let db = readDB();
  db.Grup = db.Grup || {};

  db.Grup[groupName] = db.Grup[groupName] || { 
    Id: chatId, 
    Left: { gcLeft: false, leftText: "👋 Selamat tinggal @user!" } 
  };

  if (status !== undefined) db.Grup[groupName].Left.gcLeft = status;
  if (text) db.Grup[groupName].Left.leftText = text;

  saveDB(db);
};

const Connect = {
  log: (text) => console.log(`[LOG] ${text}`),
  error: (text) => console.error(`[ERROR] ${text}`)
};

const Format = {
  time: () => moment().format('HH:mm'),
  realTime: () => moment().tz('Asia/Jakarta').format('HH:mm:ss DD-MM-YYYY'),
  date: (timestamp) => moment(timestamp * 1000).format('DD-MM-YYYY'),
  uptime: () => {
    let totalSeconds = process.uptime();
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
};

const download = async (url, filePath) => {
  try {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    Connect.error('Gagal mendownload media:', error);
    throw new Error('Gagal mendownload media');
  }
};

const createSticker = async (media, isVideo = false) => {
  const inputPath = path.join(tempFolder, isVideo ? 'input.mp4' : 'input.png');
  const outputPath = path.join(tempFolder, 'output.webp');

  fs.writeFileSync(inputPath, media);

  try {
    let ffmpegCommand = isVideo
      ? `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos,format=rgba" -r 10 -an -vsync vfr ${outputPath}`
      : `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos" ${outputPath}`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (err, stdout, stderr) => {
        if (err) {
          Connect.error(`[FFMPEG ERROR] ${stderr}`);
          return reject(new Error('FFmpeg gagal memproses media'));
        }
        resolve();
      });
    });

    const sticker = new Sticker(outputPath, {
      pack: footer,
      author: botName,
      type: StickerTypes.FULL,
      quality: 80,
    });

    const buffer = await sticker.toBuffer();

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return buffer;
  } catch (error) {
    Connect.error('❌ Gagal membuat stiker:', error.message);

    try { fs.unlinkSync(inputPath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}

    throw error;
  }
};

const target = (message, senderId) => {
  let targetId;
  if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    targetId = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
  } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
    targetId = message.message.extendedTextMessage.contextInfo.participant;
  } else {
    targetId = senderId;
  }

  return targetId.replace(/@s.whatsapp.net$/, '');
};

const onlyOwner = async (plugin, conn, message) => {
  const chatId = message.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? message.key.participant : message.key.remoteJid;

  if (plugin.isOwner) {
    const senderNumber = senderId.replace(/\D/g, '');
    if (!global.ownerNumber.includes(senderNumber)) {
      await conn.sendMessage(chatId, { text: owner }, { quoted: message });
      return false;
    }
  }
  return true;
};

const onlyPremium = async (plugin, conn, message) => {
  const chatId = message.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? message.key.participant : message.key.remoteJid;

  if (plugin.isPremium) {
    const userData = global.getUserData(senderId);
    if (!userData || !userData.premium?.prem) {
      await conn.sendMessage(chatId, { text: isPrem }, { quoted: message });
      return false;
    }
  }
  return true;
};

module.exports = {
  Connect,
  createSticker,
  download,
  Format,
  target,
  onlyOwner,
  onlyPremium,
  initializeDatabase,
  readDB,
  saveDB,
  getWelcomeStatus,
  getWelcomeText,
  setWelcomeSettings,
  getLeftStatus,
  getLeftText,
  setLeftSettings
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[file];
  require(file);
});