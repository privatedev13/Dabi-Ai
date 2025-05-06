const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

const dbFolder = path.join(__dirname, '../toolkit/db');
const dbFile = path.join(dbFolder, 'database.json');

const initializeDatabase = () => {
  if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ Private: {}, Grup: {} }, null, 2));
  }
};

const readDB = () => {
  if (!fs.existsSync(dbFile)) return { Private: {}, Grup: {} };

  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    return data ? JSON.parse(data) : { Private: {}, Grup: {} };
  } catch (error) {
    console.error('Error membaca database:', error);
    return { Private: {}, Grup: {} };
  }
};

const saveDB = (data) => {
  if (typeof data !== 'object' || data === null) {
    console.error('Data yang disimpan harus berupa objek.');
    return;
  }
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

const getGroupSetting = (chatId, type, key, defVal) => {
  const group = Object.values(readDB().Grup || {}).find(g => g.Id === chatId);
  const value = group?.[type]?.[key];
  return (typeof value === 'string' && value.trim() === '') ? defVal : (value ?? defVal);
};

const getWelcomeStatus = chatId => getGroupSetting(chatId, 'Welcome', 'welcome', false);
const getWelcomeText = chatId => getGroupSetting(chatId, 'Welcome', 'welcomeText', '👋 Selamat datang @user di grup!');
const getLeftStatus = chatId => getGroupSetting(chatId, 'Left', 'gcLeft', false);
const getLeftText = chatId => getGroupSetting(chatId, 'Left', 'leftText', '👋 Selamat tinggal @user!');

const setGroupSetting = (chatId, groupName, type, statusKey, statusVal, textKey, textVal) => {
  const db = readDB();
  db.Grup = db.Grup || {};
  db.Grup[groupName] = db.Grup[groupName] || { Id: chatId };
  db.Grup[groupName][type] = db.Grup[groupName][type] || {};
  if (statusVal !== undefined) db.Grup[groupName][type][statusKey] = statusVal;
  if (textVal) db.Grup[groupName][type][textKey] = textVal;
  saveDB(db);
};

const setWelcomeSettings = (chatId, groupName, status, text) =>
  setGroupSetting(chatId, groupName, 'Welcome', 'welcome', status, 'welcomeText', text);

const setLeftSettings = (chatId, groupName, status, text) =>
  setGroupSetting(chatId, groupName, 'Left', 'gcLeft', status, 'leftText', text);

const Connect = {
  log: text => console.log(`[LOG] ${text}`),
  error: text => console.error(`[ERROR] ${text}`)
};

const Format = {
  time: () => moment().format('HH:mm'),
  realTime: () => moment().tz('Asia/Jakarta').format('HH:mm:ss DD-MM-YYYY'),
  date: ts => moment(ts * 1000).format('DD-MM-YYYY'),
  uptime: () => {
    const sec = process.uptime();
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
  }
};

const download = async (url, filePath) => {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({ url, method: 'GET', responseType: 'stream' });
  response.data.pipe(writer);
  return new Promise((res, rej) => {
    writer.on('finish', res);
    writer.on('error', rej);
  });
};

const createSticker = async (media, isVideo = false) => {
  const inputPath = path.join(tempFolder, isVideo ? 'input.mp4' : 'input.png');
  const outputPath = path.join(tempFolder, 'output.webp');
  fs.writeFileSync(inputPath, media);

  try {
    const cmd = isVideo
      ? `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos,format=rgba" -r 10 -an -vsync vfr ${outputPath}`
      : `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos" ${outputPath}`;

    await new Promise((res, rej) => {
      exec(cmd, (err, _, stderr) => err ? rej(stderr) : res());
    });

    const sticker = new Sticker(outputPath, {
      pack: footer,
      author: botName,
      type: StickerTypes.FULL,
      quality: 80
    });

    const buffer = await sticker.toBuffer();
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    return buffer;
  } catch (e) {
    Connect.error('❌ Gagal membuat stiker:', e.message);
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
    throw e;
  }
};

const target = (msg, senderId) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const mentioned = ctx.mentionedJid?.[0];
  const replied = ctx.participant;
  const id = mentioned || replied || senderId;
  return id.replace(/@s\.whatsapp\.net$/, '');
};

const onlyOwner = async (plugin, conn, msg) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? msg.key.participant : msg.key.remoteJid;

  if (plugin.isOwner) {
    const num = senderId.replace(/\D/g, '');
    if (!global.ownerNumber.includes(num)) {
      await conn.sendMessage(chatId, { text: owner }, { quoted: msg });
      return false;
    }
  }
  return true;
};

const onlyPremium = async (plugin, conn, msg) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? msg.key.participant : msg.key.remoteJid;

  if (plugin.isPremium) {
    const user = global.getUserData(senderId);
    if (!user?.premium?.prem) {
      await conn.sendMessage(chatId, { text: isPrem }, { quoted: msg });
      return false;
    }
  }
  return true;
};

const updateBio = async conn => {
  if (global.bioInterval) clearInterval(global.bioInterval);
  global.bioInterval = setInterval(async () => {
    if (!global.autoBio) return clearInterval(global.bioInterval);
    try {
      await conn.updateProfileStatus(`${botName} Aktif ${Format.uptime()}`);
    } catch (err) {
      console.error('❌ Gagal memperbarui bio:', err);
    }
  }, 60000);
};

const parseMessage = (message, prefixes) => {
  const chatId = message?.key?.remoteJid;
  const isGroup = chatId?.endsWith('@g.us');
  const senderId = isGroup ? message?.key?.participant : chatId;

  const textMessage =
    message.body ||
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    message.message?.imageMessage?.caption ||
    message.message?.videoMessage?.caption ||
    message.message?.documentMessage?.fileName ||
    message.message?.locationMessage?.name ||
    message.message?.locationMessage?.address ||
    message.message?.contactMessage?.displayName ||
    message.message?.pollCreationMessage?.name ||
    message.message?.reactionMessage?.text ||
    '';

  if (!textMessage) return null;

  const prefix = prefixes.find(p => textMessage.startsWith(p));
  if (!prefix) return null;

  const args = textMessage.slice(prefix.length).trim().split(/\s+/);
  const commandText = args.shift()?.toLowerCase();

  return {
    chatId,
    isGroup,
    senderId,
    textMessage,
    prefix,
    commandText,
    args
  };
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
  setLeftSettings,
  updateBio,
  parseMessage
};

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[require.resolve(__filename)];
  require(__filename);
});