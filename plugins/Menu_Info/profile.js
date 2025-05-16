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
  }) => {
    try {
      const { chatId, senderId, pushName } = chatInfo;
      const targetId = target(message, senderId);
      const mentionTarget = `${targetId}@s.whatsapp.net`;

      intDB();
      const db = readDB();

      const userKey = getUser(db, mentionTarget);
      if (!userKey) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Kamu belum terdaftar di database!\n\nKetik *${prefix}daftar* untuk mendaftar.`,
        }, { quoted: message });
      }

      const userData = db.Private[userKey];

      if (commandText.toLowerCase() === 'claim') {
        const result = await tryFree(mentionTarget);
        return conn.sendMessage(chatId, {
          text: result.message
        }, { quoted: message });
      }

      let isPremiumText = "Tidak ❌";
      if (userData.isPremium?.isPrem) {
        const now = Date.now();
        const activated = userData.isPremium.activatedAt || now;
        const expired = activated + userData.isPremium.time;

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

      const claimText = !userData.claim
        ? `Kamu bisa claim trial premium dengan *${prefix}claim*`
        : `Kamu sudah claim trial`;

      let profileText = `${head} ${Obrack} Profil @${targetId} ${Cbrack}\n`;
      profileText += `${side} ${btn} *Nomor:* ${userData.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n`;
      profileText += `${side} ${btn} *Auto AI:* ${userData.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n`;
      profileText += `${side} ${btn} *Total Chat:* ${userData.chat}\n`;
      profileText += `${side} ${btn} *Umur:* ${userData.umur}\n`;
      profileText += `${side} ${btn} *Status Premium:* ${userData.isPremium?.isPrem ? "Ya ✅" : "Tidak ❌"}\n`;
      profileText += `${side} ${btn} *Premium Tersisa:* ${isPremiumText}\n`;
      profileText += `${side} ${btn} *Nomor Id:* ${userData.noId || "Tidak ada"}\n`;
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
      conn.sendMessage(chatId, {
        text: "⚠️ Terjadi kesalahan saat mengambil profil!"
      }, { quoted: message });
    }
  },
};