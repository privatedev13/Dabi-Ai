/*
 * Create By Dabi
 * © 2025
 */

const globalSetting = require('./toolkit/setting');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { isPrefix } = globalSetting;
const { loadPlug } = require('./toolkit/helper');
const Cc = require('./temp/prgM.js');
const { handleGame } = require('./toolkit/funcGame');
const {
  set,
  get,
  delete: del,
  reset,
  memoryCache,
  timer,
  labvn
} = require('./toolkit/transmitter.js');

const logger = pino({ level: 'silent' });

global.plugins = {};
global.categories = {};

intDB();

setInterval(() => {
  const db = readDB();

  Object.keys(db.Private).forEach((key) => {
    const user = db.Private[key];
    if (user.isPremium?.isPrem) {
      if (user.isPremium.time > 60000) {
        user.isPremium.time -= 60000;
      } else {
        user.isPremium.isPrem = false;
        user.isPremium.time = 0;
      }
    }

    if (user.afk?.afkTime) {
      user.afk.Time = Math.floor(Date.now() / 1000);
    }
  });

  saveDB(db);
}, 60000);

const mute = async (chatId, senderId, conn) => {
  const db = readDB();
  const groupData = Object.values(db.Grup).find((g) => g.Id === chatId);

  if (groupData?.mute) {
    const groupMetadata = await conn.groupMetadata(chatId);
    const groupAdmins = groupMetadata.participants.filter((p) => p.admin);
    const isAdmin = groupAdmins.some((admin) => admin.id === senderId);

    if (!isAdmin) return true;
  }

  return false;
};

const Public = (senderId) => {
  if (!global.public) {
    const senderNumber = senderId.replace(/\D/g, '');
    return !global.ownerNumber.includes(senderNumber);
  }
  return false;
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      messageCache: 3750,
      logger: logger,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
    });

    conn.ev.on('creds.update', saveCreds);

    if (!state.creds?.me?.id) {
      console.log(chalk.blueBright.bold('📱 Masukkan nomor bot WhatsApp Anda:'));
      let phoneNumber = await question('> ');

      phoneNumber = await global.calNumber(phoneNumber);
 
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.greenBright.bold('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    timer(conn);
    if (!conn.reactionCache) conn.reactionCache = new Map();

    conn.ev.on('connection.update', ({ connection }) => {
      const messages = {
        open: () => {
          console.log(chalk.greenBright.bold('✅ Bot online!'));
          global.autoBio && updateBio(conn);
        },
        connecting: () => console.log(chalk.yellowBright.bold('🔄 Menghubungkan kembali...')),
        close: () => {
          console.log(chalk.redBright.bold('❌ Koneksi terputus, mencoba menyambung ulang...'));
          startBot();
        }
      };
      messages[connection]?.();
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
      if (!messages?.length) return;
      const msg = messages[0];
      if (!msg?.message) return;

      const msgType = msg.message;
      if (
        msgType?.conversation ||
        msgType?.extendedTextMessage ||
        msgType?.imageMessage ||
        msgType?.videoMessage
      ) {
        conn.reactionCache.set(msg.key.id, msg);
        setTimeout(() => conn.reactionCache.delete(msg.key.id), 3 * 60 * 1000);
      }

      const { chatId, isGroup, senderId, pushName } = exCht(msg);
      const time = Format.time();

      const db = readDB();
      const userDb = Object.values(db?.Private || {}).find(user => user.Nomor === senderId) || {};
      const isPrem = userDb.isPremium?.isPrem;
      const senderNumber = senderId?.split('@')[0];
      if (!senderNumber) {
        console.error(chalk.redBright.bold('Gagal mendapatkan nomor pengirim.'));
        return;
      }

      let displayName = pushName || 'Pengguna';
      if (isGroup && chatId.endsWith('@g.us')) {
        const metadata = await mtData(chatId, conn);
        displayName = metadata ? `${metadata.subject} | ${displayName}` : `Grup Tidak Dikenal | ${displayName}`;
      } else if (chatId === 'status@broadcast') {
        displayName = `${displayName} | Status`;
      }

      let textMessage = '';
      let mediaInfo = '';

      if (msg.message.groupStatusMentionMessage) {
        mediaInfo = '[ Status Grup ]';
        textMessage = 'Grup ini disebut dalam status';
      }

      if (msg.message.conversation) {
        textMessage = msg.message.conversation;
      } else if (msg.message.extendedTextMessage?.text) {
        textMessage = msg.message.extendedTextMessage.text;
      } else if (msg.message.imageMessage?.caption) {
        textMessage = msg.message.imageMessage.caption;
      } else if (msg.message.videoMessage?.caption) {
        textMessage = msg.message.videoMessage.caption;
      } else if (msg.message.reactionMessage) {
        const reactedText = msg.message.reactionMessage.text;
        textMessage = `Memberi reaksi ${reactedText}`;
      } else if (msg.message.protocolMessage?.type === 14) {
        textMessage = `Pesan Diedit ${textMessage}`;
      } else if (msg.message.protocolMessage?.type === 0) {
        textMessage = 'Pesan Dihapus';
      } else if (msg.message.ephemeralMessage?.message?.conversation) {
        textMessage = msg.message.ephemeralMessage.message.conversation;
      } else if (msg.message.ephemeralMessage?.message?.extendedTextMessage?.text) {
        textMessage = msg.message.ephemeralMessage.message.extendedTextMessage.text;
      }

      const mediaTypes = {
        imageMessage: '[ Gambar ]',
        videoMessage: '[ Video ]',
        audioMessage: '[ Audio ]',
        documentMessage: '[ Dokumen ]',
        stickerMessage: '[ Stiker ]',
        locationMessage: '[ Lokasi ]',
        contactMessage: '[ Kontak ]',
        pollCreationMessage: '[ Polling ]',
        liveLocationMessage: '[ Lokasi Live ]',
        reactionMessage: '[ Reaksi ]',
        protocolMessage: '[ Sistem ]',
        ephemeralMessage: '[ Sekali Lihat ]'
      };

      for (const [key, value] of Object.entries(mediaTypes)) {
        if (msg.message[key]) mediaInfo = value;
        if (key === 'ephemeralMessage' && msg.message.ephemeralMessage?.message) {
          const nestedKey = Object.keys(msg.message.ephemeralMessage.message)[0];
          if (nestedKey && mediaTypes[nestedKey]) mediaInfo = mediaTypes[nestedKey];
        }
      }

      console.log(chalk.yellowBright.bold(`【 ${displayName} 】:`) + chalk.cyanBright.bold(` [ ${time} ]`));
      if (mediaInfo && textMessage) console.log(chalk.whiteBright.bold(`  ${mediaInfo} | [ ${textMessage} ]`));
      else if (mediaInfo) console.log(chalk.whiteBright.bold(`  ${mediaInfo}`));
      else if (textMessage) console.log(chalk.whiteBright.bold(`  [ ${textMessage} ]`));

      await labvn(textMessage, msg, conn, chatId)
      await Cc(conn, msg, textMessage);

      if (await gcFilter(conn, msg, chatId, senderId, isGroup)) return;
      if (await bdWrd(conn, msg, chatId, senderId, isGroup)) return;
      if (await mute(chatId, senderId, conn)) return;
      if (Public(senderId)) return;
      if (msg.message.reactionMessage) await rctKey(msg, conn);

      const { ownerSetting } = setting;
      global.lastGreet = global.lastGreet || {};
      if (
        chatId.endsWith('@g.us') &&
        ownerSetting.forOwner &&
        ownerSetting.ownerNumber.includes(senderNumber) &&
        Date.now() - (global.lastGreet[senderId] || 0) > 5 * 60 * 1000
      ) {
        global.lastGreet[senderId] = Date.now();
        const greetText = setting?.msg?.rejectMsg?.forOwnerText || "Selamat datang owner ku";
        await conn.sendMessage(chatId, { text: greetText, mentions: [senderId] }, { quoted: msg });
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([msg.key]);
      }
      if (global.autoTyping) {
        await conn.sendPresenceUpdate("composing", chatId);
        setTimeout(() => conn.sendPresenceUpdate("paused", chatId), 3000);
      }

      await afkCencel(senderId, chatId, msg, conn);
      await afkTgR(msg, conn);

      const isGame = await handleGame(conn, msg, chatId, textMessage);

      if (await global.chtEmt(textMessage, msg, senderId, chatId, conn)) return;

      if (!isPrem) {
        const mode = global.setting?.botSetting?.Mode || 'private';
        if (mode === 'group' && !isGroup) return;
        if (mode === 'private' && isGroup) return;
      }

      const parsedPrefix = parseMessage(msg, isPrefix);
      const parsedNoPrefix = parseNoPrefix(msg);
      if (!parsedPrefix && !parsedNoPrefix) return;

      const { getDbUsr, getNmbUsr } = require('./toolkit/transmitter');

      const runPlugin = async (parsed, prefixUsed) => {
        const { commandText, chatInfo } = parsed;
        const sender = chatInfo.senderId;

        for (const [fileName, plugin] of Object.entries(global.plugins)) {
          if (!plugin?.command?.includes(commandText)) continue;

          if (prefixUsed && !getDbUsr(sender) && !plugin.whiteLiss) {
            await conn.sendMessage(chatInfo.chatId, {
              text: '❌ Kamu belum terdaftar.\nKetik *.daftar* untuk mendaftar.'
            }, { quoted: msg });
            return;
          }

          const pluginPrefix = plugin.prefix;
          const canRun =
            pluginPrefix === 'both' ||
            (pluginPrefix === false && !prefixUsed) ||
            ((pluginPrefix === true || pluginPrefix === undefined) && prefixUsed);

          if (!canRun) continue;

          try {
            await plugin.run(conn, msg, { ...parsed, isPrefix });

            const db = readDB();
            const userData = getUser(db, sender);
            if (userData) {
              db.Private[userData.key].cmd = (db.Private[userData.key].cmd || 0) + 1;
              saveDB(db);
            }

          } catch (err) {
            console.log(chalk.redBright.bold(`❌ Error pada plugin: ${fileName}\n${err.message}`));
          }

          break;
        }
      };

      if (parsedPrefix) await runPlugin(parsedPrefix, true);
      if (parsedNoPrefix) await runPlugin(parsedNoPrefix, false);
    });

    conn.ev.on('group-participants.update', async (event) => {
      const { id: chatId, participants, action } = event;

      try {
        const isWelcome = enGcW(chatId) && action === 'add';
        const isLeave = enGcL(chatId) && (action === 'remove' || action === 'leave');

        let textTemplate = '';
        if (isWelcome) textTemplate = getWlcTxt(chatId);
        if (isLeave) textTemplate = getLftTxt(chatId);

        if (isWelcome || isLeave) {
          for (const participant of participants) {
            const userTag = `@${participant.split('@')[0]}`;
            const text = textTemplate.replace(/@user|%user/g, userTag);

            await conn.sendMessage(chatId, {
              text,
              mentions: [participant],
            });
          }
        }

        if (['promote', 'demote'].includes(action)) {
          global.groupCache = global.groupCache || new Map();
          global.groupCache.delete(chatId);
          await mtData(chatId, conn);
        }
      } catch (error) {
        console.error(chalk.redBright.bold('❌ Error saat menangani group-participants.update:'), error);
      }
    });
  } catch (error) {
    console.error(chalk.redBright.bold('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyanBright.bold('Create By Dabi\n'));
loadPlug();
startBot();
watchCfg();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  console.log(chalk.yellowBright.inverse.italic(`[ PERUBAHAN TERDETEKSI ] ${__filename}, harap restart bot manual.`));
});