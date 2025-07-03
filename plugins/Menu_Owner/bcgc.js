const fs = require("fs");

let isBroadcasting = false;
const delayTime = 5 * 60 * 1000;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: 'bcgc',
  command: ['bcgc', 'broadcastgc'],
  tags: 'Owner Menu',
  desc: 'Mengirim pesan broadcast ke semua grup.',
  prefix: true,
  isPremium: true,

  run: async (conn, msg, {
    chatInfo,
    textMessage,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!(await isPrem(module.exports, conn, msg))) return;

    const commandWithPrefix = `${prefix}${commandText}`;
    const broadcastMessage = textMessage.slice(commandWithPrefix.length).trim();

    if (!broadcastMessage) {
      return conn.sendMessage(chatId, { text: `❌ Pesan broadcast tidak boleh kosong! Gunakan format:\n\`${commandWithPrefix} [pesan]\`` }, { quoted: msg });
    }

    if (isBroadcasting) {
      return conn.sendMessage(chatId, { text: "⏳ Harap tunggu! Anda harus menunggu sebelum menjalankan perintah ini lagi." }, { quoted: msg });
    }

    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    if (groupIds.length === 0) {
      return conn.sendMessage(chatId, { text: "❌ Bot tidak tergabung dalam grup mana pun." }, { quoted: msg });
    }

    isBroadcasting = true;
    conn.sendMessage(chatId, { text: `📢 Mengirim broadcast ke ${groupIds.length} grup...` }, { quoted: msg });

    let success = 0, failed = 0;
    let failedGroups = [];

    for (const id of groupIds) {
      try {
        await conn.sendMessage(id, {
          text: broadcastMessage,
          contextInfo: {
            forwardingScore: 0,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363310100263711@newsletter'
            }
          }
        }, { quoted: msg });

        success++;
      } catch {
        failed++;
        failedGroups.push(`- ${groups[id]?.subject || "Unknown"} (${id})`);
      }

      await delay(3000);
    }

    let resultText = `✅ Broadcast selesai!\n\n📤 Berhasil: ${success} grup\n❌ Gagal: ${failed} grup`;

    if (failedGroups.length > 0) {
      resultText += `\n\n*Daftar Grup Gagal:*\n${failedGroups.join("\n")}`;
    }

    conn.sendMessage(chatId, { text: resultText }, { quoted: msg });

    setTimeout(() => {
      isBroadcasting = false;
      conn.sendMessage(chatId, { text: "✅ Perintah broadcast sekarang bisa digunakan lagi." }, { quoted: msg });
    }, delayTime);
  }
};