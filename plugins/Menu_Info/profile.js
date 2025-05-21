module.exports = {
  name: 'profile',
  command: ['profile', 'profil', 'me', 'claim'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi profil.',
  prefix: true,

  run: async (conn, message, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, pushName } = chatInfo;
    try {
      const targetId = target(message, senderId);
      const mentionTarget = `${targetId}@s.whatsapp.net`;

      intDB();
      const db = readDB();

      const userData = getUser(db, mentionTarget);
      if (!userData) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Kamu belum terdaftar di database!\n\nKetik *${prefix}daftar* untuk mendaftar.`,
        }, { quoted: message });
      }

      const user = userData.value;

      if (commandText.toLowerCase() === 'claim') {
        const result = await tryFree(mentionTarget);
        return conn.sendMessage(chatId, {
          text: result.message
        }, { quoted: message });
      }

      let isPremiumText = "Tidak ❌";
      if (user.isPremium?.isPrem) {
        const now = Date.now();
        const activated = user.isPremium.activatedAt || now;
        const expired = activated + user.isPremium.time;

        if (expired > now) {
          const remaining = expired - now;
          const m = Math.floor(remaining / (1000 * 60));
          const h = Math.floor(m / 60);
          const d = Math.floor(h / 24);
          isPremiumText = d > 0
            ? `${d} Hari ${h % 24} Jam ${m % 60} Menit`
            : h > 0
              ? `${h} Jam ${m % 60} Menit`
              : `${m} Menit`;
        } else {
          isPremiumText = "Kadaluarsa ❗";
        }
      }

      const claimText = !user.claim
        ? `Kamu bisa claim trial premium dengan *${prefix}claim*`
        : `Kamu sudah claim trial`;

      let profileText = `${head} ${Obrack} Profil @${targetId} ${Cbrack}\n`;
      profileText += `${side} ${btn} *Nomor:* ${user.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n`;
      profileText += `${side} ${btn} *Auto AI:* ${user.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n`;
      profileText += `${side} ${btn} *Private Cmd:* ${user.cmd || 0}\n`;
      profileText += `${side} ${btn} *Umur:* ${user.umur || "Tidak diatur"}\n`;
      profileText += `${side} ${btn} *Status Premium:* ${user.isPremium?.isPrem ? "Ya ✅" : "Tidak ❌"}\n`;
      profileText += `${side} ${btn} *Premium Tersisa:* ${isPremiumText}\n`;
      profileText += `${side} ${btn} *Nomor Id:* ${user.noId || "Tidak ada"}\n`;
      profileText += `${foot}${garis}\n\n`;
      profileText += `${claimText}`;

      await conn.sendMessage(chatId, {
        text: profileText,
        mentions: [mentionTarget],
        contextInfo: {
          externalAdReply: {
            title: pushName,
            body: `Ini adalah Profile ${pushName}`,
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
          mentionedJid: [mentionTarget],
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter'
          }
        }
      }, { quoted: message });

    } catch (error) {
      console.error("Error di plugin profile.js:", error);
      await conn.sendMessage(chatInfo.chatId, {
        text: "⚠️ Terjadi kesalahan saat mengambil profil!"
      }, { quoted: message });
    }
  },
};