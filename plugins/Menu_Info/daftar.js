module.exports = {
  name: 'daftar',
  command: ['daftar', 'register', 'daftargc'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan pengguna atau grup.',
  prefix: true,
  whiteLiss: true,

  run: async (conn, msg, { chatInfo, textMessage, prefix, commandText, args }) => {
    const { chatId, senderId, isGroup, pushName } = chatInfo;
    try {
      intDB();
      const db = readDB();

      db.Private = db.Private || {};
      db.Grup = db.Grup || {};

      if (commandText === 'daftargc') {
        if (!isGroup) {
          return conn.sendMessage(chatId, { text: '❌ Perintah ini hanya bisa digunakan di dalam grup.' }, { quoted: msg });
        }

        const metadata = await conn.groupMetadata(chatId);
        const groupName = metadata.subject;

        if (Object.values(db.Grup).some(g => g.Id === chatId)) {
          return conn.sendMessage(chatId, { text: '✅ Grup ini sudah terdaftar di database.' }, { quoted: msg });
        }

        db.Grup[groupName] = {
          Id: chatId,
          autoai: false,
          bell: false,
          mute: false,
          setWarn: 0,
          gbFilter: {
            Welcome: { welcome: false, welcomeText: '' },
            Left: { gcLeft: false, leftText: '' },
            link: { antilink: false, setlink: '' },
            stiker: { antistiker: false },
            antibot: false,
            antiTagSw: false
          },
          antibadword: { badword: false, badwordText: '' }
        };

        saveDB(db);
        return conn.sendMessage(chatId, { text: `✅ Grup *${groupName}* berhasil didaftarkan ke dalam database.` }, { quoted: msg });
      }

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `📌 Cara daftar:\n\n*${prefix}daftar Nama Kamu Umur*\n\nContoh:\n*${prefix}daftar ${pushName} 15*`
        }, { quoted: msg });
      }

      const nama = args.slice(0, -1).join(' ');
      const umur = parseInt(args.at(-1));

      if (isNaN(umur) || umur < 12 || umur > 100) {
        return conn.sendMessage(chatId, { text: `❌ ️Maaf, umur kamu terlalu kecil untuk mendaftar.` }, { quoted: msg });
      }

      if (getUser(db, senderId)) {
        return conn.sendMessage(chatId, {
          text: `❌ Nama *${nama}* sudah terdaftar!\n\nGunakan nama lain atau cek profil dengan *${prefix}profile*.`
        }, { quoted: msg });
      }

      const generateId = () => [...Array(7)].map(() => 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.random() * 26 | 0)).join('') + (Math.floor(Math.random() * 100) + 1);

      db.Private[nama] = {
        Nomor: senderId,
        umur: umur.toString(),
        noId: generateId(),
        autoai: false,
        bell: false,
        cmd: 0,
        claim: false,
        isPremium: { isPrem: false, time: 0 },
        afk: {}
      };

      saveDB(db);

      conn.sendMessage(chatId, {
        text:
          `✅ Pendaftaran berhasil!\n\n` +
          `🔹 Nama: *${nama}*\n` +
          `🔹 Umur: *${umur}*\n` +
          `🔹 ID: *${db.Private[nama].noId}*\n\n` +
          `Ketik *${prefix}profile* untuk melihat profil.`,
        contextInfo: { mentionedJid: [senderId] }
      }, { quoted: msg });

    } catch (err) {
      console.error('Error di plugin daftar.js:', err);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat mendaftar!' }, { quoted: msg });
    }
  },
};