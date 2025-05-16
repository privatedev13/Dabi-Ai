const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');

const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

const dbFolder = path.join(__dirname, '../toolkit/db');
const dbFile = path.join(dbFolder, 'database.json');

const intDB = () => {
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

const getUser = (db, number) => {
  if (!db || typeof db !== 'object' || !db.Private) return null;
  return Object.keys(db.Private).find(key => db.Private[key].Nomor === number);
};

const getGroupData = (chatId) => {
  const db = readDB();
  return Object.values(db.Grup || {}).find(g => g.Id === chatId);
};

const enGcW = (chatId) => {
  const data = getGroupData(chatId);
  return data?.gbFilter?.Welcome?.welcome === true;
};

const getWelcTxt = (chatId) => {
  const data = getGroupData(chatId);
  const text = data?.gbFilter?.Welcome?.welcomeText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat datang @user di grup!';
};

const enGcL = (chatId) => {
  const data = getGroupData(chatId);
  return data?.gbFilter?.Left?.gcLeft === true;
};

const getLeftTxt = (chatId) => {
  const data = getGroupData(chatId);
  const text = data?.gbFilter?.Left?.leftText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat tinggal @user!';
};

const loadGroupDB = (chatId) => {
  const db = readDB();
  let groupData = getGroupData(chatId);

  if (!groupData) {
    db.Grup[chatId] = {
      id: chatId,
      gbFilter: {}
    };
    groupData = db.Grup[chatId];
  }

  groupData.gbFilter = groupData.gbFilter || {};
  return { db, groupData };
};

const stGcW = (chatId, isOn, welcomeText) => {
  const { db, groupData } = loadGroupDB(chatId);
  groupData.gbFilter.Welcome = groupData.gbFilter.Welcome || {};
  groupData.gbFilter.Welcome.welcome = isOn;
  if (welcomeText !== undefined) {
    groupData.gbFilter.Welcome.welcomeText = welcomeText;
  }
  saveDB(db);
};

const stGcL = (chatId, isOn, leftText) => {
  const { db, groupData } = loadGroupDB(chatId);
  groupData.gbFilter.Left = groupData.gbFilter.Left || {};
  groupData.gbFilter.Left.gcLeft = isOn;
  if (leftText !== undefined) {
    groupData.gbFilter.Left.leftText = leftText;
  }
  saveDB(db);
};

const exGrp = async (conn, chatId, senderId) => {
  const metadata = await mtData(chatId, conn);
  if (!metadata) return {};

  const groupName = metadata.subject;
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const participants = metadata.participants;
  const adminList = participants.filter(p => p.admin).map(p => p.id);

  return {
    metadata,
    groupName,
    botNumber,
    botAdmin: adminList.includes(botNumber),
    userAdmin: adminList.includes(senderId),
    adminList
  };
};

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

const target = (msg, senderId) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const mentioned = ctx.mentionedJid?.[0];
  const replied = ctx.participant;
  const id = mentioned || replied || senderId;
  return id.replace(/@s.whatsapp.net$/, '');
};

const chkOwner = async (plugin, conn, msg) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? msg.key.participant : msg.key.remoteJid;

  if (plugin.owner) {
    const num = senderId.replace(/\D/g, '');
    if (!global.ownerNumber.includes(num)) {
      await conn.sendMessage(chatId, { text: owner }, { quoted: msg });
      return false;
    }
  }
  return true;
};

const chkPrem = async (plugin, conn, msg) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  const senderId = isGroup ? msg.key.participant : msg.key.remoteJid;

  if (plugin.premium) {
    const user = global.getUserData(senderId);
    if (!user?.premium?.prem) {
      await conn.sendMessage(chatId, { text: prem }, { quoted: msg });
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

const isAutoAiEnabled = (senderId, chatId) => {
  const database = readDB();

  if (chatId.endsWith('@s.whatsapp.net')) {
    for (const key in database.Private) {
      const user = database.Private[key];
      if (user.Nomor === senderId) {
        return user.autoai === true;
      }
    }
  } else if (chatId.endsWith('@g.us')) {
    for (const key in database.Grup) {
      const group = database.Grup[key];
      if (group.Id === chatId) {
        return group.autoai === true;
      }
    }
  }

  return false;
};

const chtEmt = async (textMessage, message, senderId, chatId, conn) => {
  const botRawId = conn.user?.id || '';
  const botNumber = botRawId.split(':')[0] + '@s.whatsapp.net';
  const botName = global.botName?.toLowerCase();

  if (senderId === botRawId || message.key.fromMe) return false;

  const contextInfo = message.message?.extendedTextMessage?.contextInfo;
  const mentionedJids = contextInfo?.mentionedJid || [];
  const participant = contextInfo?.participant || '';
  const isReplyToBot = participant === botNumber;
  const isMentionedBot = mentionedJids.includes(botNumber);

  if (contextInfo && participant && !isReplyToBot && !isMentionedBot) return false;

  if (!isAutoAiEnabled(senderId, chatId)) return false;

  if (
    textMessage &&
    (
      textMessage.toLowerCase().includes(botName) ||
      isReplyToBot ||
      isMentionedBot
    )
  ) {
    const aiReply = await global.ai(textMessage, message, senderId);

    if (aiReply?.status && aiReply?.result) {
      await conn.sendMessage(chatId, { text: aiReply.result }, { quoted: message });
    } else {
      await conn.sendMessage(chatId, { text: 'Maaf, saya tidak mengerti.' }, { quoted: message });
    }
    return true;
  }

  return false;
};

const exCht = (message) => {
  const chatId = message?.key?.remoteJid;
  const isGroup = chatId?.endsWith('@g.us');
  const senderId = isGroup ? message?.key?.participant : chatId;
  const pushName = message.pushName || botName || 'User';
  return { chatId, isGroup, senderId, pushName };
};

const exTxtMsg = (message) => {
  return (
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
    ''
  );
};

const parseMessage = (message, prefixes) => {
  const chatInfo = exCht(message);
  const textMessage = exTxtMsg(message);

  if (!textMessage) return null;

  const prefix = prefixes.find(p => textMessage.startsWith(p));
  if (!prefix) return null;

  const args = textMessage.slice(prefix.length).trim().split(/\s+/);
  const commandText = args.shift()?.toLowerCase();

  return {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  };
};

const parseNoPrefix = (message) => {
  const chatInfo = exCht(message);
  const textMessage = exTxtMsg(message);

  if (!textMessage) return null;

  const args = textMessage.trim().split(/\s+/);
  const commandText = args.shift()?.toLowerCase();

  return {
    chatInfo,
    textMessage,
    prefix: '',
    commandText,
    args
  };
};

module.exports = {
  Connect,
  download,
  Format,
  target,
  chkOwner,
  chkPrem,
  getGroupData,
  intDB,
  readDB,
  saveDB,
  getUser,
  enGcW,
  enGcL,
  getWelcTxt,
  getLeftTxt,
  stGcW,
  stGcL,
  updateBio,
  chtEmt,
  exCht,
  parseMessage,
  parseNoPrefix,
  exGrp
};

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[require.resolve(__filename)];
  require(__filename);
});