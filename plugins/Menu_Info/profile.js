module.exports = {
  name: 'profile',
  command: ['profile', 'profil', 'me', 'claim'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi profil.',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, pushName } = chatInfo;

    try {
      const targetId = target(msg, senderId);
      const mentionTarget = `${targetId}@s.whatsapp.net`;

      intDB();
      const db = readDB();

      let userEntry = null;
      let username = null;
      for (const [key, value] of Object.entries(db.Private)) {
        if (value.Nomor === mentionTarget) {
          userEntry = value;
          username = key;
          break;
        }
      }

      if (!userEntry) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Kamu belum terdaftar di database!\n\nKetik *${prefix}daftar* untuk mendaftar.`,
        }, { quoted: msg });
      }

      const user = userEntry;

      if (commandText.toLowerCase() === 'claim') {
        const result = await tryFree(mentionTarget);
        return conn.sendMessage(chatId, {
          text: result.message
        }, { quoted: msg });
      }

      let isPremiumText = "Tidak ❌";
      if (user.isPremium?.isPrem) {
        const now = Date.now();
        const activated = user.isPremium.activatedAt || now;
        const expired = activated + user.isPremium.time;

        if (expired > now) {
          const remaining = Format.duration(now, expired);
          isPremiumText = remaining.trim();
        } else {
          isPremiumText = "Kadaluarsa ❗";
        }
      }

      const claimText = !user.claim
        ? `Kamu bisa claim trial premium dengan *${prefix}claim*`
        : `Kamu sudah claim trial`;

      let profileText = `${head} ${Obrack} Profil ${pushName} ${Cbrack}\n`;
      profileText += `${side} ${btn} *Nama:* ${username || 'Pengguna'}\n`;
      profileText += `${side} ${btn} *Nomor:* ${user.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n`;
      profileText += `${side} ${btn} *Auto AI:* ${user.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n`;
      profileText += `${side} ${btn} *Private Cmd:* ${user.cmd || 0}\n`;
      profileText += `${side} ${btn} *Umur:* ${user.umur || "Tidak diatur"}\n`;
      profileText += `${side} ${btn} *Status Premium:* ${user.isPremium?.isPrem ? "Ya ✅" : "Tidak ❌"}\n`;
      profileText += `${side} ${btn} *Premium Time:* ${isPremiumText}\n`;
      profileText += `${side} ${btn} *Nomor Id:* ${user.noId || "Tidak ada"}\n`;
      profileText += `${foot}${garis}\n\n`;
      profileText += `${claimText}`;

      await conn.sendMessage(chatId, {
        image: thumb,
        caption: profileText,
        mentions: [mentionTarget],
        contextInfo: {
          forwardingScore: 0,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter'
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error("Error di plugin profile.js:", error);
      await conn.sendMessage(chatInfo.chatId, {
        text: "⚠️ Terjadi kesalahan saat mengambil profil!"
      }, { quoted: msg });
    }
  },
};