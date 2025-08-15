const fs = require('fs');
const path = require('path');
const gamePath = path.join(__dirname, '../../toolkit/db/game.json');

module.exports = {
  name: 'create',
  command: ['create'],
  tags: 'Info Menu',
  desc: 'Membuat akun game',
  prefix: true,

  run: async (conn, msg, { chatInfo, args, prefix, commandText }) => {
    const { chatId, senderId } = chatInfo;
    const name = args.join(' ').trim();

    if (!name) return conn.sendMessage(chatId, {
      text: `Format salah!\nGunakan: *${prefix}${commandText} <namamu>*\nContoh: *${prefix}${commandText} Farhan*`
    }, { quoted: msg });

    try {
      let gameData = fs.existsSync(gamePath)
        ? JSON.parse(fs.readFileSync(gamePath))
        : { FunctionGame: {}, tca: { user: {} } };

      const users = gameData.tca.user || {};
      if (Object.values(users).some(u => u.id === senderId)) return conn.sendMessage(chatId, { text: 'Kamu sudah mempunyai akun game.' }, { quoted: msg });
      if (users[name]) return conn.sendMessage(chatId, { text: 'Nama ini sudah digunakan, silakan pilih nama lain.' }, { quoted: msg });

      users[name] = {
        id: senderId,
        lvl: global.lvl,
        maining: '0x hasil',
        inv: global.inv
      };

      gameData.tca.user = users;
      fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));

      conn.sendMessage(chatId, {
        text: `Akun berhasil dibuat!\nNama: ${name}\nLevel: ${users[name].lvl}\nketik .game untuk melihat inventory`,
      }, { quoted: msg });

    } catch (err) {
      console.error('Error create.js:', err);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat membuat akun.' }, { quoted: msg });
    }
  }
};