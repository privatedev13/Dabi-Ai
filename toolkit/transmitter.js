const fetch = require('node-fetch');
const groupCache = new Map();

async function mtData(id, conn) {
  if (groupCache.has(id)) return groupCache.get(id);
  try {
    const metadata = await conn.groupMetadata(id);
    groupCache.set(id, metadata);
    setTimeout(() => groupCache.delete(id), 2 * 60 * 1000); 
    return metadata;
  } catch (e) {
    console.error('Gagal ambil metadata grup:', e);
    return null;
  }
};

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
    if (!groupData) return;

    const metadata = await global.mtData(chatId, conn);
    const isAdmin = metadata?.participants?.find(p => p.id === senderId)?.admin;
    const botRawId = conn.user?.id || '';
    const fromMe = senderId === botRawId || message.key.fromMe;

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const hasGroupLink = await gbLink(textMessage);
    if (groupData.gbFilter.link?.antilink && hasGroupLink && !isAdmin && !fromMe) {
      await conn.sendMessage(chatId, {
        text: `🚫 Link grup terdeteksi dari @${senderId.split('@')[0]}!\nPesan akan dihapus.`,
        mentions: [senderId]
      }, { quoted: message });
      await conn.sendMessage(chatId, { delete: message.key });
      return true;
    }

    const msgType = Object.keys(message.message || {})[0];
    if (groupData.gbFilter?.stiker.antistiker && msgType === 'stickerMessage' && !isAdmin && !fromMe) {
      await conn.sendMessage(chatId, {
        text: `🚫 Stiker terdeteksi dari @${senderId.split('@')[0]}!\nPesan akan dihapus.`,
        mentions: [senderId]
      }, { quoted: message });
      await conn.sendMessage(chatId, { delete: message.key });
      return true;
    }

  } catch (err) {
    console.error('Error GroupFilter:', err);
  }
}

async function tryPrem(nomor) {
  try {
    intDB();
    const db = readDB();

    const userKey = getUser(db, nomor);
    if (!userKey) {
      return { success: false, message: 'Pengguna belum terdaftar di database.', claimable: false };
    }

    const userData = db.Private[userKey];

    if (userData.claim) {
      return {
        success: false,
        message: '⚠️ Kamu sudah pernah claim trial premium.',
        claimable: false
      };
    }

    const durationMs = 3 * 24 * 60 * 60 * 1000;
    db.Private[userKey].isPremium = {
      isPrem: true,
      time: durationMs,
      activatedAt: Date.now()
    };
    db.Private[userKey].claim = true;

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

module.exports = { 
  ai,
  mtData,
  gbLink,
  gcFilter,
  tryPrem,
  translate
};