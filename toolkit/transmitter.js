const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const chalk = require('chalk');
const { exec } = require('child_process');

const memoryCache = {};
const groupCache = new Map();

const sesiBell = path.join(__dirname, '../temp/BellaSession.json');
const sesiAi = path.join(__dirname, '../temp/AiSesion.json');

function replaceLid(obj, visited = new WeakSet()) {
  if (!obj) return obj;

  if (typeof obj === 'object') {
    if (visited.has(obj)) return obj;
    visited.add(obj);

    if (Array.isArray(obj)) return obj.map(i => replaceLid(i, visited));
    if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) return obj;

    for (const k in obj) obj[k] = replaceLid(obj[k], visited);
    return obj;
  }

  if (typeof obj === 'string') {
    if (obj.endsWith('@lid')) {
      const phone = Object.keys(global.lidCache).find(k => global.lidCache[k] === obj);
      return phone ? `${phone}@s.whatsapp.net` : obj;
    }
    obj = obj.replace(/@(\d+)(?!@)/g, (m, lid) => {
      const phone = Object.keys(global.lidCache).find(k => global.lidCache[k] === `${lid}@lid`);
      return phone ? `@${phone}` : m;
    });
    return obj.replace(/@(\d+)@lid/g, (_, id) => {
      const phone = Object.keys(global.lidCache).find(k => global.lidCache[k] === `${id}@lid`);
      return phone ? `@${phone}` : `@${id}@lid`;
    });
  }

  return obj;
}

function loadSession(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file));
}

function saveSession(file, session) {
  fs.writeFileSync(file, JSON.stringify(session, null, 2));
}

async function bell(body) {
  try {
    const res = await fetch(`${termaiWeb}/api/chat/logic-bell?key=${termaiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.error(chalk.red('Request Error:'), e.message);
    return { status: false, msg: 'Request gagal terkirim.' };
  }
}

async function Elevenlabs(text, voice = "dabi", pitch = 0, speed = 0.9) {
  try {
    const response = await fetch(`${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=${pitch}&speed=${speed}&key=${termaiKey}`);
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

async function logicBella(text, msg, senderId, conn) {
  const session = loadSession(sesiBell);

  const res = await bell({
    text,
    id: senderId,
    fullainame: botFullName,
    nickainame: botName,
    senderName: msg.pushName || 'Unknown',
    ownerName,
    date: new Date().toISOString(),
    role: "Sahabat Deket",
    msgtype: "text",
    custom_profile: logic,
    commands: [{
      description: "Jika perlu direspon dengan suara",
      output: {
        cmd: "voice",
        msg: "Pesan di sini. Gunakan gaya bicara <nickainame> yang menarik dan realistis, lengkap dengan tanda baca yang tepat agar terdengar hidup saat diucapkan."
      }
    }]
  });
  console.log(res);
  console.log(bell);

  if (!res.status) {
    console.error('Bella response failed:', res.msg);
    return { cmd: 'text', msg: `Maaf, Bella lagi error. Coba lagi nanti ya.` };
  }

  const { msg: replyMsg, cmd } = res.data;

  session[senderId] ??= [];
  session[senderId].push({ time: new Date().toISOString(), user: text, response: replyMsg, cmd });
  saveSession(sesiBell, session);

  if (cmd === 'voice') {
    const audio = await Elevenlabs(replyMsg);
    return { cmd: 'voice', msg: replyMsg, audio };
  }

  return { cmd, msg: replyMsg };
}

async function ai(textMessage, msg, senderId) {
  const ctx = global.logic;
  const url = `${global.siptzKey}/api/ai/gpt3`;
  const ses = loadSession(sesiAi);

  ses[senderId] ??= [{ role: "system", content: ctx }];
  ses[senderId].push({ role: 'user', content: textMessage });

  const body = JSON.stringify(ses[senderId].filter(v => v.role !== 'assistant'));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const json = await res.json();
    if (json?.status && json?.data) {
      ses[senderId].push({ role: "assistant", content: json.data });
      saveSession(sesiAi, ses);
      return json.data;
    }
    throw new Error("Invalid response");
  } catch (e) {
    console.error(chalk.redBright.bold('Ai Error: ', e.message));
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

async function mtData(id, conn, retry = 2) {
  if (!global.groupCache) global.groupCache = new Map();
  if (global.groupCache.has(id)) return global.groupCache.get(id);

  try {
    const metadata = await conn.groupMetadata(id);
    global.groupCache.set(id, metadata);
    setTimeout(() => global.groupCache.delete(id), 2 * 60 * 1000);
    return metadata;
  } catch (e) {
    if (retry > 0) {
      console.warn(`Gagal ambil metadata grup, coba ulang... (${3 - retry}/2)`, e?.message);
      await new Promise(r => setTimeout(r, 1000));
      return mtData(id, conn, retry - 1);
    }
    console.error('Gagal ambil metadata grup setelah percobaan ulang:', e);
    return null;
  }
}

async function saveLid(meta) {
  for (const p of meta?.participants || []) {
    const phone = p.phoneNumber?.replace(/@.*/, '');
    const lid = p.id?.endsWith('@lid') ? p.id : null;
    if (phone && lid) global.lidCache[phone] = lid;
  }
}

async function gbLink(text) {
  if (!text) return false;
  const regex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,20}/i;
  return regex.test(text);
}

async function gcFilter(conn, msg, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const groupData = gcData(getDB(), chatId);
    if (!groupData || !groupData.gbFilter) return;

    const { userAdmin, botNumber } = await stGrup(conn, chatId, senderId);
    const fromMe = senderId === botNumber || msg.key?.fromMe;

    if (userAdmin || fromMe) return;

    let textMessage = msg.message?.conversation 
      || msg.message?.extendedTextMessage?.text 
      || '';
    const msgType = Object.keys(msg.message || {})[0];

    const isTagSw = Boolean(msg.message?.groupStatusMentionMessage);
    if (isTagSw) textMessage = 'Grup ini disebut dalam status';

    const checks = [
      {
        enabled: groupData.gbFilter?.link?.antilink,
        condition: await gbLink(textMessage),
        reason: 'Link grup terdeteksi',
      },
      {
        enabled: groupData.gbFilter?.stiker?.antistiker,
        condition: msgType === 'stickerMessage',
        reason: 'Stiker terdeteksi',
      },
      {
        enabled: groupData.gbFilter?.antibot === true,
        condition: (() => {
          const context = msg.message?.contextInfo || {};
          const fwdScore = context.forwardingScore || 0;
          const isForwardedFromChannel = !!context.externalAdReply || context.forwardedNewsletterMessage != null;
          const isForwarded = fwdScore > 0 || isForwardedFromChannel;
          const hasMenuWords = /menu|owner|allmenu/i.test(textMessage);

          const isDoc = msgType === 'documentMessage';
          return isForwarded || hasMenuWords || isDoc;
        })(),
        reason: 'Deteksi konten mencurigakan',
      },
      {
        enabled: groupData.gbFilter?.antiTagSw === true,
        condition: isTagSw,
        reason: 'Tag status terdeteksi',
      }
    ];

    for (const check of checks) {
      if (check.enabled && check.condition) {
        await conn.sendMessage(chatId, {
          text: `🚫 ${check.reason} dari @${senderId.split('@')[0]}!\nPesan akan dihapus.`,
          mentions: [senderId],
        }, { quoted: msg });

        await conn.sendMessage(chatId, { delete: msg.key });
        return true;
      }
    }

  } catch (err) {
    console.error('Error GroupFilter:', err);
  }
}

async function tryPrem(senderId) {
  try {
    const user = getUser(senderId);

    if (!user) return { success: false, message: 'Pengguna belum terdaftar.', claimable: false };
    if (user.value.claim) return { success: false, message: '⚠️ Sudah pernah claim trial.', claimable: false };

    const { key, db } = user;
    const now = Date.now();
    const claimPrem = 3 * 24 * 60 * 60 * 1000;
    const remainPrem = db.Private[key].isPremium?.time || 0;

    db.Private[key].isPremium = {
      isPrem: true,
      time: remainPrem + claimPrem,
      activatedAt: now
    };

    db.Private[key].claim = true;
    saveDB(db);

    return { success: true, message: '✅ Trial Premium 3 hari ditambahkan.', claimable: false };
  } catch (e) {
    console.error('tryPrem error:', e);
    return { success: false, message: 'Terjadi kesalahan.', claimable: false };
  }
}

async function translate(q, tl = 'id') {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t&tl=${tl}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    console.error('Error during translation:', err);
    return null;
  }
}

async function colNumb(input) {
  let number = input.replace(/\D/g, '');
  return number.startsWith('0') ? '62' + number.slice(1) : number;
}

async function bdWord(conn, msg, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const group = gcData(getDB(), chatId);
    if (!group?.antibadword?.badword) return;

    const { userAdmin, botNumber } = await stGrup(conn, chatId, senderId);
    const fromMe = senderId === botNumber || msg.key?.fromMe;
    if (userAdmin || fromMe) return;

    const badwords = group.antibadword.badwordText
      ?.toLowerCase()
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    if (!badwords?.length) return;

    const text = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      ''
    ).toLowerCase();

    if (badwords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text))) {
      await conn.sendMessage(
        chatId,
        {
          text: `⚠️ Pesan dari @${senderId.split('@')[0]} mengandung kata terlarang.\nPesan akan dihapus.`,
          mentions: [senderId]
        },
        { quoted: msg }
      );

      await conn.sendMessage(chatId, { delete: msg.key });
    }
  } catch (err) {
    console.error('[bdWord] Error:', err);
  }
}

async function afkCencel(senderId, chatId, msg, conn) {
  const user = getUser(senderId);
  if (!user?.value?.afk?.afkTime) return;

  const { afkTime, reason = 'Tidak ada alasan' } = user.value.afk;
  const waktu = Format.duration(afkTime, Date.now()) || 'Baru saja';

  user.value.afk = {};
  saveDB();

  await conn.sendMessage(chatId, {
    text: `✅ *Kamu telah kembali dari AFK!*\n⏱️ Durasi: ${waktu}\n📌 Alasan sebelumnya: ${reason}`,
    mentions: [senderId]
  }, { quoted: msg });
}

async function afkTgR(msg, conn) {
  const botNumber = (conn.user?.id || '').split(':')[0] + '@s.whatsapp.net';
  const { remoteJid: chatId, participant, fromMe } = msg.key;
  const sender = participant || chatId;
  if (fromMe || sender === botNumber) return;

  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const targets = [...(ctx.mentionedJid || []), ctx.participant]
    .filter(jid => jid && jid !== botNumber);

  for (const jid of targets) {
    const user = getUser(jid);
    if (!user?.value?.afk?.afkTime) continue;

    const { afkTime, reason = 'Tidak ada alasan' } = user.value.afk;
    const waktu = Format.duration(afkTime, Date.now()) || 'Baru saja';
    const type = jid === ctx.participant ? 'reply' : 'mention';

    const text =
      type === 'reply'
        ? `*Jangan ganggu dia!*\nOrang yang kamu reply sedang AFK.\n⏱️ Durasi: ${waktu}\n📌 Alasan: ${reason}`
        : `*Jangan tag dia!*\nOrang yang kamu tag sedang AFK.\n⏱️ Durasi: ${waktu}\n📌 Alasan: ${reason}`;

    await conn.sendMessage(chatId, { text, mentions: [jid] }, { quoted: msg });
  }
}

const funcUrl = 'https://raw.githubusercontent.com/MaouDabi0/Dabi-Ai-Documentation/main/assets/funcFile/function.js';

const loadFunc = async () => {
  const response = await fetch(funcUrl);
  const code = await response.text();

  const sandbox = { module: {}, exports: {}, require, console };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  return sandbox.module.exports;
};

const cache = {
  set: (key, value) => (memoryCache[key] = value),
  get: key => memoryCache[key],
  delete: key => delete memoryCache[key],
  reset: () => {
    for (const key in memoryCache) delete memoryCache[key];
    console.log(chalk.yellowBright.bold(`[ CACHE ] Semua cache dihapus dari memori pada ${new Date().toLocaleString()}`));
  }
};

setInterval(cache.reset, 60 * 60 * 1000);
cache.reset();

async function getStId(msg) {
  try {
    const stanzaId = msg?.message?.extendedTextMessage?.contextInfo?.stanzaId || null
    return stanzaId
  } catch (err) {
    console.error('Gagal mengambil stanzaId:', err);
    return null
  }
}

const voiceList = new Set([
  'prabowo','yanzgpt','bella','megawati','echilling','adam','thomas_shelby',
  'michi_jkt48','nokotan','jokowi','boboiboy','keqing','anya','yanami_anna',
  'MasKhanID','Myka','raiden','CelzoID', 'dabi'
]);

async function labvn(message, msg, conn, chatId, prefix = '.') {
  if (!message?.startsWith(prefix)) return;

  const [cmd, ...args] = message.slice(prefix.length).trim().split(/\s+/);
  const voice = cmd.toLowerCase();
  if (!voiceList.has(voice)) return;

  if (!(await isPrem({ premium: true }, conn, msg))) return;

  const text = args.join(' ').trim();
  if (!text) return;

  try {
    const url = `${termaiWeb}/api/text2speech/elevenlabs?text=${encodeURIComponent(text)}&voice=${voice}&pitch=0&speed=0.9&key=${termaiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const audio = Buffer.from(await res.arrayBuffer());
    await conn.sendMessage(chatId, { audio, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(chatId, { text: '⚠️ *Gagal membuat suara!*' }, { quoted: msg });
  }
}

function msgDate(msg) {
  let textMessage = '';
  let mediaInfo = '';

  if (!msg?.message) return { textMessage, mediaInfo };

  const m = msg.message;

  if (m.groupStatusMentionMessage) {
    mediaInfo = '[ Status Grup ]';
    textMessage = 'Grup ini disebut dalam status';
  }

  if (m.conversation) {
    textMessage = m.conversation;
  } else if (m.extendedTextMessage?.text) {
    textMessage = m.extendedTextMessage.text;
  } else if (m.imageMessage?.caption) {
    textMessage = m.imageMessage.caption;
  } else if (m.videoMessage?.caption) {
    textMessage = m.videoMessage.caption;
  } else if (m.reactionMessage) {
    const reactedText = m.reactionMessage.text;
    textMessage = `Memberi reaksi ${reactedText}`;
  } else if (m.protocolMessage?.type === 14) {
    textMessage = `Pesan Diedit ${textMessage}`;
  } else if (m.protocolMessage?.type === 0) {
    textMessage = 'Pesan Dihapus';
  } else if (m.ephemeralMessage?.message?.conversation) {
    textMessage = m.ephemeralMessage.message.conversation;
  } else if (m.ephemeralMessage?.message?.extendedTextMessage?.text) {
    textMessage = m.ephemeralMessage.message.extendedTextMessage.text;
  }

  const mediaTypes = {
    imageMessage: 'Gambar',
    videoMessage: 'Video',
    audioMessage: 'Audio',
    documentMessage: 'Dokumen',
    stickerMessage: 'Stiker',
    locationMessage: 'Lokasi',
    contactMessage: 'Kontak',
    pollCreationMessage: 'Polling',
    liveLocationMessage: 'Lokasi Live',
    reactionMessage: 'Reaksi',
    protocolMessage: 'Sistem',
    ephemeralMessage: 'Sekali Lihat'
  };

  for (const [key, value] of Object.entries(mediaTypes)) {
    if (m[key]) mediaInfo = value;
    if (key === 'ephemeralMessage' && m.ephemeralMessage?.message) {
      const nestedKey = Object.keys(m.ephemeralMessage.message)[0];
      if (nestedKey && mediaTypes[nestedKey]) mediaInfo = mediaTypes[nestedKey];
    }
  }

  return { textMessage, mediaInfo };
}

const userSpam = {};

async function checkSpam(senderId, conn, chatId, msg) {
  const user = getUser(senderId);
  if (!user) return false;

  const now = Date.now();
  const key = user.key;

  if (!userSpam[key]) {
    userSpam[key] = { count: 1, last: now };
    return false;
  }

  const diff = now - userSpam[key].last;

  if (diff <= 3000) {
    userSpam[key].count++;
    userSpam[key].last = now;

    if (userSpam[key].count >= 3) {
      await conn.sendMessage(chatId, { text: "Jangan spam" }, { quoted: msg });
      userSpam[key].count = 0;
      return true;
    }
  } else if (diff > 7000) {
    userSpam[key] = { count: 1, last: now };
  } else {
    userSpam[key].last = now;
  }

  return false;
}

module.exports = {
  ai,
  mtData,
  gbLink,
  gcFilter,
  tryPrem,
  translate,
  colNumb,
  bdWord,
  afkCencel,
  afkTgR,
  loadFunc,
  cache,
  getStId,
  logicBella,
  labvn,
  msgDate,
  saveLid,
  replaceLid,
  checkSpam
};