const fetch = require('node-fetch');
const groupCache = new Map();

async function mtData(id, conn) {
  if (!global.groupCache) global.groupCache = new Map();
  if (global.groupCache.has(id)) return global.groupCache.get(id);

  try {
    const metadata = await conn.groupMetadata(id);
    global.groupCache.set(id, metadata);
    setTimeout(() => global.groupCache.delete(id), 2 * 60 * 1000);
    return metadata;
  } catch (e) {
    console.error('Gagal ambil metadata grup:', e);
    return null;
  }
}

async function ai(textMessage, message, senderId) {
  const context = global.logic
    .replace("${ownerName}", global.ownerName)
    .replace("${senderName}", message.pushName || senderId.split('@')[0]);

  const apiUrl = `${global.zellApi}/ai/custom`;

  try {
    const res = await fetch(`${apiUrl}?text=${encodeURIComponent(textMessage)}&logic=${encodeURIComponent(context)}`);
    const json = await res.json();
    return json;
  } catch (e) {
    console.error("Error in ai():", e.message);
    return {};
  }
}

async function gbLink(text) {
  if (!text) {
    return false;
  }

  const regex = /https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{15,20}/i;
  const match = text.match(regex);
  return regex.test(text);
}

async function gcFilter(conn, message, chatId, senderId, isGroup) {
  if (!isGroup) return;

  try {
    const db = readDB();
    const groupData = Object.values(db.Grup).find(g => g.Id === chatId);
    if (!groupData || !groupData.gbFilter) return;

    const metadata = await global.mtData(chatId, conn);
    const isAdmin = metadata?.participants?.find(p => p.id === senderId)?.admin;
    const botRawId = conn.user?.id || '';
    const fromMe = senderId === botRawId || message.key.fromMe;

    if (isAdmin || fromMe) return;

    let textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const msgType = Object.keys(message.message || {})[0];
    
    const isTagSw =
      !!message.message?.groupStatusMentionMessage ||
      !!message.message?.extendedTextMessage?.contextInfo?.groupStatusMentionMessage ||
      !!message.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo?.groupStatusMentionMessage;

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
        const context = message.message?.contextInfo || {};
        const fwdScore = context.forwardingScore || 0;
        const isForwardedFromChannel = !!context.externalAdReply || context.forwardedNewsletterMessage != null;
        const isForwarded = fwdScore > 0 || isForwardedFromChannel;
        const hasMenuWords = /menu|owner|allmenu/i.test(textMessage);
        const hasPreview = !!(
          message.message?.extendedTextMessage?.thumbnailUrl || 
          message.message?.extendedTextMessage?.mediaUrl
        );
        const isDoc = msgType === 'documentMessage';

        return isForwarded || hasMenuWords || hasPreview || isDoc;
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
        }, { quoted: message });

        await conn.sendMessage(chatId, { delete: message.key });
        return true;
      }
    }

  } catch (err) {
    console.error('Error GroupFilter:', err);
  }
}

async function tryPrem(nomor) {
  try {
    intDB();
    const db = readDB();

    const user = getUser(db, nomor);
    if (!user) {
      return { success: false, message: 'Pengguna belum terdaftar di database.', claimable: false };
    }

    const { key, value } = user;

    if (value.claim) {
      return {
        success: false,
        message: '⚠️ Kamu sudah pernah claim trial premium.',
        claimable: false
      };
    }

    const durationMs = 3 * 24 * 60 * 60 * 1000;
    db.Private[key].isPremium = {
      isPrem: true,
      time: durationMs,
      activatedAt: Date.now()
    };
    db.Private[key].claim = true;

    saveDB(db);

    return {
      success: true,
      message: '✅ Trial Premium 3 hari berhasil diberikan.',
      claimable: false
    };

  } catch (error) {
    console.error('Error di fungsi tryPrem:', error);
    return { success: false, message: 'Terjadi kesalahan internal.', claimable: false };
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
  let number = input.replace(/[^0-9]/g, '');
  number = number.replace(/^0/, '62');
  if (!number.startsWith('62')) number = '62' + number;
  return number;
}

module.exports = { 
  ai,
  mtData,
  gbLink,
  gcFilter,
  tryPrem,
  translate,
  colNumb
};