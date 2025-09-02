const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const chalk = require('chalk');

const pluginDir = path.join(__dirname, '../plugins');
const dbFolder = path.join(__dirname, './db');
const dbFile = path.join(dbFolder, 'database.json');
const dbPath = './toolkit/db/datatoko.json';

const loadPlug = () => {
  if (!fs.existsSync(pluginDir)) return;

  let loaded = 0, failed = 0;
  const errors = [];

  global.plugins = {};
  global.categories = {};

  for (const folder of fs.readdirSync(pluginDir)) {
    const folderPath = path.join(pluginDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
      const filePath = path.join(folderPath, file);
      try {
        delete require.cache[require.resolve(filePath)];
        const plugin = require(filePath);
        if (plugin?.run) {
          const name = path.basename(file, '.js');
          plugin.__path = filePath;
          global.plugins[name] = plugin;
          const tag = plugin.tags || 'Uncategorized';
          global.categories[tag] = global.categories[tag] || [];
          global.categories[tag].push(plugin.command);
          loaded++;
        }
      } catch (err) {
        failed++;
        errors.push(`❌ ${file}: ${err.message}`);
      }
    }
  }

  if (!failed) console.log(chalk.greenBright.bold(`✅ ${loaded} plugin dimuat.`));
  else {
    errors.forEach(msg => console.log(chalk.redBright.bold(msg)));
    console.log(chalk.yellowBright.bold(`⚠️ ${loaded} plugin dimuat, ${failed} gagal.`));
  }

  return { loaded, errors: failed, messages: errors };
};

let db = { Private: {}, Grup: {} };

const intDB = () => {
  if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  } else {
    try {
      const file = fs.readFileSync(dbFile, 'utf-8');
      db = file ? JSON.parse(file) : db;
    } catch (e) {
      console.error('[DB] Gagal membaca file:', e);
    }
  }
};

const getDB = () => db;

const saveDB = () => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('[DB] Gagal simpan:', e);
  }
};

const getUser = (senderId) => {
  const db = getDB();
  if (!db?.Private) return null;
  const key = Object.keys(db.Private).find(k => db.Private[k]?.Nomor === senderId);
  return key ? { key, value: db.Private[key] } : null;
};

const getGrpDB = (db, chatId) => {
  if (!db?.Grup) return null;
  return Object.values(db.Grup).find(g => String(g?.Id) === String(chatId)) || null;
};

const enGcW = (chatId) => {
  const db = getDB();
  const data = getGrpDB(db, chatId);
  return data?.gbFilter?.Welcome?.welcome === true;
};

const getWelcTxt = (chatId) => {
  const db = getDB();
  const data = getGrpDB(db, chatId);
  const text = data?.gbFilter?.Welcome?.welcomeText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat datang @user di grup!';
};

const enGcL = (chatId) => {
  const db = getDB();
  const data = getGrpDB(db, chatId);
  return data?.gbFilter?.Left?.gcLeft === true;
};

const getLeftTxt = (chatId) => {
  const db = getDB();
  const data = getGrpDB(db, chatId);
  const text = data?.gbFilter?.Left?.leftText;
  return (typeof text === 'string' && text.trim()) ? text : '👋 Selamat tinggal @user!';
};

const loadGrpDB = (chatId) => {
  const db = getDB();
  let groupData = getGrpDB(db, chatId);

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

  const adminList = (metadata.participants || [])
    .filter(p => p.admin)
    .map(p => p.phoneNumber);

  const botNumber = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';

  return {
    metadata,
    groupName: metadata.subject,
    botNumber,
    botAdmin: adminList.includes(botNumber),
    userAdmin: adminList.includes(senderId),
    adminList
  };
};

const Format = {
  time: () => moment().format("HH:mm"),
  realTime: () => moment().tz("Asia/Jakarta").format("HH:mm:ss DD-MM-YYYY"),
  date: ts => moment(ts * 1000).format("DD-MM-YYYY"),
  uptime: () => {
    const sec = process.uptime();
    return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
  },
  duration: (start, end) => {
    const dur = end - start;
    const d = Math.floor(dur / 86400000);
    const h = Math.floor((dur % 86400000) / 3600000);
    const m = Math.floor((dur % 3600000) / 60000);
    return `${d ? d + " Hari " : ""}${h ? h + " Jam " : ""}${m ? m + " Menit" : ""}`.trim();
  },
  toTime: ms => {
    if (!ms || typeof ms !== "number") return "-";
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${d ? d + " Hari " : ""}${h ? h + " Jam " : ""}${m ? m + " Menit " : ""}${s ? s + " Detik" : ""}`.trim();
  },
  parseDuration: str => {
    const [, num, unit] = /^(\d+)([smhd])$/i.exec(str) || [];
    const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return map[unit?.toLowerCase()] ? parseInt(num) * map[unit.toLowerCase()] : null;
  },
  toNumber: num => {
    if (typeof num !== "number") return "-";
    return num.toLocaleString("id-ID");
  },
  indoTime: (zone = "Asia/Jakarta", format = "HH:mm:ss DD-MM-YYYY") => {
    return moment().tz(zone).format(format);
  }
};

const target = (msg, senderId) => {
  const c = msg.message?.extendedTextMessage?.contextInfo || {};
  const clean = jid => jid?.replace(/@s\.whatsapp\.net$/i, '').replace(/\D/g, '');

  if (c.quotedMessage && c.participant)
    return clean(c.participant);

  if (Array.isArray(c.mentionedJid) && c.mentionedJid.length)
    return clean(c.mentionedJid[0]);

  if (msg.key?.participant)
    return clean(msg.key.participant);

  return clean(senderId);
};

const getSenderId = (msg) => {
  const chatId = msg?.key?.remoteJid;
  const isGroup = chatId?.endsWith('@g.us');
  const senderId = isGroup
    ? (msg.key.participant || msg.key.participant)
    : chatId;
  return { chatId, senderId };
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
  if (plugin.premium) {
    const { chatId, senderId } = getSenderId(msg);
    const user = global.getUserData(senderId);
    if (!user) {
      console.log(`User data not found for senderId: ${senderId}`);
    }
    if (!user?.isPremium?.isPrem) {
      await conn.sendMessage(chatId, {
        text: prem,
        contextInfo: {
          externalAdReply: {
            title: "Stop",
            body: "Hanya Untuk Pengguna Premium",
            thumbnailUrl: 'https://c.termai.cc/i56/Fg50KYE.jpg',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: idCh
          }
        }
      }, { quoted: msg });
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
      const bio = global.bioText
        .replace(/<waktu>|<time>/gi, Format.uptime())
        .replace(/<botName>/gi, global.botName);
      
      await conn.updateProfileStatus(bio);
    } catch (err) {
      console.error(chalk.redBright.bold('❌ Gagal memperbarui bio:'), err);
    }
  }, 60000);
};

const getDBFlag = (senderId, chatId, key) => {
  const db = getDB();
  const isPrivate = chatId.endsWith('@s.whatsapp.net');
  const target = isPrivate ? db.Private : db.Grup;

  for (const item of Object.values(target)) {
    if ((isPrivate && item.Nomor === senderId) || (!isPrivate && item.Id === chatId)) {
      return item[key] === true;
    }
  }
  return false;
};

const chtEmt = async (textMessage, msg, senderId, chatId, conn) => {
  const botId = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
  const botName = global.botName?.toLowerCase();
  const prefixes = [].concat(global.setting?.isPrefix || '.');

  if (prefixes.some(p => textMessage?.startsWith(p))) return false;
  if (senderId === conn.user?.id || msg.key.fromMe) return false;

  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const { mentionedJid = [], participant = '' } = ctx;
  const replyBot = participant === botId;
  const mentionBot = mentionedJid.includes(botId);

  if (ctx && participant && !replyBot && !mentionBot) return false;

  const ai = getDBFlag(senderId, chatId, 'autoai');
  const bell = getDBFlag(senderId, chatId, 'bell');
  if (!ai && !bell) return false;

  const trigger = textMessage?.toLowerCase().includes(botName) || replyBot || mentionBot;
  if (!trigger) return false;

  if (ai) {
    const res = await global.ai(textMessage, msg, senderId);
    await conn.sendMessage(chatId, { text: res || 'Maaf, saya tidak mengerti.' }, { quoted: msg });
  }

  if (bell) {
    const res = await Bella(textMessage, msg, senderId);
    if (res.cmd === 'voice' && res.audio) {
      await conn.sendMessage(chatId, { audio: Buffer.from(res.audio), mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
    } else if (res.msg) {
      await conn.sendMessage(chatId, { text: res.msg }, { quoted: msg });
    }
  }
  return true;
};

const exCht = (msg = {}) => {
  let chatId = msg?.key?.remoteJid || '';
  const isGroup = chatId.endsWith('@g.us');

  let senderId = msg?.key?.fromMe
    ? chatId
    : msg?.key?.participant || chatId;

  const pushName = (msg?.pushName || global.botName || 'User').trim();

  chatId = replaceLid(chatId);
  senderId = replaceLid(senderId);

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

const randomId = () => {
  const abjad = 'abcdefghijklmnopqrstuvwxyz';
  return [...Array(7)].map(() => abjad[Math.floor(Math.random() * 26)]).join('') + (Math.floor(Math.random() * 100) + 1);
};

const authUser = (msg, chatInfo) => {
  const db = getDB();
  const { senderId, isGroup, chatId } = chatInfo;
  const nama = (msg.pushName || '-').trim().slice(0, 30);
  const nomor = senderId;

  if (Object.values(db.Private || {}).some(u => u.Nomor === nomor)) return;

  const fromParticipant = msg?.key?.participant || null;
  if (isGroup && fromParticipant && senderId !== fromParticipant) return;
  if (!isGroup && Object.values(db.Private || {}).some(u => u.Nomor === chatId)) return;

  db.Private ??= {};
  let finalName = nama, count = 1;
  while (db.Private[finalName]) finalName = `${nama}_${count++}`;

  db.Private[finalName] = {
    Nomor: nomor,
    noId: randomId(),
    autoai: false,
    bell: false,
    cmd: 0,
    claim: false,
    ban: false,
    money: { amount: 300000 },
    isPremium: { isPrem: false, time: 0 },
    afk: {}
  };

  saveDB();
};

const banned = (senderId) => {
  let userData = getUser(senderId);

  if (!userData) {
    const db = getDB();
    const cleanedSender = senderId.replace(/\D/g, '');
    const found = Object.values(db.Private || {}).find(
      u => u?.Nomor?.replace(/\D/g, '').endsWith(cleanedSender)
    );
    if (found) userData = { value: found };
  }

  return userData?.value?.ban === true;
};

async function shopHandle(conn, msg, textMessage, chatId, senderId) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted || textMessage?.trim().toLowerCase() !== 'done') return;
  if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) return;

  const { stanzaId: qId, participant: qUser } = quoted;
  if (!fs.existsSync(dbPath)) return;

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const orders = dbData.pendingOrders || [];
  const order = orders.find(o => o.userId === qUser && o.idChat === qId);
  if (!order) return conn.sendMessage(chatId, { text: "Transaksi tidak ditemukan." }, { quoted: msg });

  dbData.pendingOrders = orders.filter(o => o.userId !== qUser || o.idChat !== qId);
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

  const res = `Pembelian dikonfirmasi\n\nUser: @${qUser.split('@')[0]}\nToko: ${order.toko}\nBarang: ${order.barang}\nHarga: Rp${parseInt(order.harga).toLocaleString()}`;
  await conn.sendMessage(chatId, { text: res, mentions: [qUser] }, { quoted: msg });
}

module.exports = {
  loadPlug,
  Format,
  target,
  chkOwner,
  chkPrem,
  getGrpDB,
  intDB,
  getDB,
  saveDB,
  getUser,
  enGcW,
  enGcL,
  loadGrpDB,
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
  shopHandle,
  authUser,
  banned
};