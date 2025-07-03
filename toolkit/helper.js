const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const chalk = require('chalk');

const thumb = fs.readFileSync('./toolkit/set/Dabi.jpg');

const pluginDir = path.join(__dirname, '../plugins');
const loadPlug = () => {
  if (!fs.existsSync(pluginDir)) {
    console.log(chalk.yellowBright.bold(`⚠️ Plugin folder tidak ditemukan: ${pluginDir}`));
    return;
  }

  let loaded = 0;
  let failed = 0;
  const errors = [];

  const pluginFolders = fs.readdirSync(pluginDir)
    .filter(name => fs.statSync(path.join(pluginDir, name)).isDirectory());

  for (const folder of pluginFolders) {
    const folderPath = path.join(pluginDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      try {
        const plugin = require(filePath);
        if (plugin?.run) {
          const name = path.basename(file, '.js');
          global.plugins[name] = plugin;

          const tag = plugin.tags || 'Uncategorized';
          global.categories[tag] = global.categories[tag] || [];
          global.categories[tag].push(plugin.command);

          loaded++;
        }
      } catch (err) {
        failed++;
        errors.push(chalk.redBright.bold(`❌ Gagal memuat plugin ${file}: ${err.message}`));
      }
    }
  }

  if (failed === 0) {
    console.log(chalk.greenBright.bold(`✅ ${loaded} plugin berhasil dimuat.`));
  } else {
    errors.forEach(msg => console.log(msg));
    console.log(chalk.yellowBright.bold(`⚠️ ${loaded} plugin dimuat, ${failed} gagal.`));
  }

  return { loaded, errors: failed, messages: errors };
};

const tmpFoldr = path.join(__dirname, '../temp');
if (!fs.existsSync(tmpFoldr)) fs.mkdirSync(tmpFoldr, { recursive: true });

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
    console.error(chalk.redBright.bold('Error membaca database:', error));
    return { Private: {}, Grup: {} };
  }
};

const saveDB = (data) => {
  if (typeof data !== 'object' || data === null) {
    console.error(chalk.redBright.bold('Data yang disimpan harus berupa objek.'));
    return;
  }
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

const getUser = (db, number) => {
  if (!db || typeof db !== 'object' || !db.Private) return null;

  const key = Object.keys(db.Private).find(k => db.Private[k].Nomor === number);
  if (!key) return null;
  return { key, value: db.Private[key] };
};

const getGrpDB = (chatId) => {
  const db = readDB();
  return Object.values(db.Grup || {}).find(g => (g.Id || '').toString() === chatId.toString());
};

const enGcW = (chatId) => {
  const data = getGrpDB(chatId);
  return data?.gbFilter?.Welcome?.welcome === true;
};

const getWelcTxt = (chatId) => {
  const data = getGrpDB(chatId);
  const text = data?.gbFilter?.Welcome?.welcomeText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat datang @user di grup!';
};

const enGcL = (chatId) => {
  const data = getGrpDB(chatId);
  return data?.gbFilter?.Left?.gcLeft === true;
};

const getLeftTxt = (chatId) => {
  const data = getGrpDB(chatId);
  const text = data?.gbFilter?.Left?.leftText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat tinggal @user!';
};

const loadGrpDB = (chatId) => {
  const db = readDB();
  let groupData = getGrpDB(chatId);

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
  const { db, groupData } = loadGrpDB(chatId);
  groupData.gbFilter.Welcome = groupData.gbFilter.Welcome || {};
  groupData.gbFilter.Welcome.welcome = isOn;
  if (welcomeText !== undefined) {
    groupData.gbFilter.Welcome.welcomeText = welcomeText;
  }
  saveDB(db);
};

const stGcL = (chatId, isOn, leftText) => {
  const { db, groupData } = loadGrpDB(chatId);
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

const Format = {
  time: () => moment().format('HH:mm'),
  realTime: () => moment().tz('Asia/Jakarta').format('HH:mm:ss DD-MM-YYYY'),
  date: ts => moment(ts * 1000).format('DD-MM-YYYY'),
  uptime: () => {
    const sec = process.uptime();
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  },
  duration: (start, end) => {
    const dur = end - start;
    const d = Math.floor(dur / (1000 * 60 * 60 * 24));
    const h = Math.floor((dur % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((dur % (1000 * 60 * 60)) / (1000 * 60));
    return `${d ? `${d} Hari ` : ''}${h ? `${h} Jam ` : ''}${m ? `${m} Menit ` : ''}`.trim();
  }
};

const target = (msg, senderId) => {
  const context = msg.message?.extendedTextMessage?.contextInfo || {};
  const isReply = context.quotedMessage && context.participant;
  const isMention = context.mentionedJid?.length;

  if (isReply) return context.participant.replace(/@s\.whatsapp\.net$/, '');
  if (isMention) return context.mentionedJid[0].replace(/@s\.whatsapp\.net$/, '');
  return senderId.replace(/@s\.whatsapp\.net$/, '');
};

const getSenderId = (msg) => {
  const chatId = msg?.key?.remoteJid;
  const isGroup = chatId.endsWith('@g.us');
  return { chatId, senderId: isGroup ? msg.key.participant : chatId };
};

const chkOwner = async (plugin, conn, msg) => {
  if (plugin.owner) {
    const { chatId, senderId } = getSenderId(msg);
    const num = senderId.replace(/\D/g, '');
    if (!global.ownerNumber.includes(num)) {
      await conn.sendMessage(chatId, { text: owner }, { quoted: msg });
      return false;
    }
  }
  return true;
};

const chkPrem = async (plugin, conn, msg) => {
  if (plugin.isPremium) {
    const { chatId, senderId } = getSenderId(msg);
    const user = global.getUserData(senderId);
    if (!user?.isPremium?.isPrem) {
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
      console.error(chalk.redBright.bold('❌ Gagal memperbarui bio:', err));
    }
  }, 60000);
};

const AiDB = (senderId, chatId) => {
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

const chtEmt = async (textMessage, msg, senderId, chatId, conn) => {
  const botRwId = conn.user?.id || '';
  const botNumber = botRwId.split(':')[0] + '@s.whatsapp.net';
  const botName = global.botName?.toLowerCase();

  if (senderId === botRwId || msg.key.fromMe) return false;

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mentionJid = contextInfo?.mentionedJid || [];
  const participant = contextInfo?.participant || '';
  const replyBot = participant === botNumber;
  const mentionBot = mentionJid.includes(botNumber);

  if (contextInfo && participant && !replyBot && !mentionBot) return false;

  if (!AiDB(senderId, chatId)) return false;

  if (
    textMessage &&
    (
      textMessage.toLowerCase().includes(botName) ||
      replyBot ||
      mentionBot
    )
  ) {
    const aiReply = await global.ai(textMessage, msg, senderId);

    if (aiReply) {
      await conn.sendMessage(chatId, { text: aiReply }, { quoted: msg });
    } else {
      await conn.sendMessage(chatId, { text: 'Maaf, saya tidak mengerti.' }, { quoted: msg });
    }
    return true;
  }

  return false;
};

const exCht = (msg = {}) => {
  const chatId = msg?.key?.remoteJid || '';
  const isGroup = chatId.endsWith('@g.us');

  const senderId = msg?.key?.fromMe
    ? msg?.key?.remoteJid
    : msg?.key?.participant || msg?.key?.remoteJid;

  const pushName = msg?.pushName || global.botName || 'User';

  return { chatId, isGroup, senderId, pushName };
};

const exTxtMsg = (msg) => {
  return (
    msg.body ||
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.documentMessage?.fileName ||
    msg.message?.locationMessage?.name ||
    msg.message?.locationMessage?.address ||
    msg.message?.contactMessage?.displayName ||
    msg.message?.pollCreationMessage?.name ||
    msg.message?.reactionMessage?.text ||
    ''
  );
};

const parseMessage = (msg, prefixes) => {
  const chatInfo = exCht(msg);
  const textMessage = exTxtMsg(msg);

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

const parseNoPrefix = (msg) => {
  const chatInfo = exCht(msg);
  const textMessage = exTxtMsg(msg);

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
  loadPlug,
  Format,
  target,
  chkOwner,
  chkPrem,
  getGrpDB,
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
  exGrp,
  thumb
};

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[require.resolve(__filename)];
  require(__filename);
});