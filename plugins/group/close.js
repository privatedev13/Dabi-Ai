export default {
  name: 'close',
  command: ['close', 'tutup'],
  tags: 'Group Menu',
  desc: 'Menutup chat group WhatsApp',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });

    try {
      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
      if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
      if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

      const groupData = getGc(getDB(), chatId);
      if (!groupData) return conn.sendMessage(chatId, { text: 'Grup belum terdaftar di database.\nGunakan *daftargc* untuk mendaftar.' }, { quoted: msg });

      groupData.gbFilter ??= {};
      groupData.gbFilter.close ??= {};

      if (args[0]) {
        const duration = Format.parseDuration(args[0]);
        if (!duration) {
          return conn.sendMessage(chatId, { text: 'Format waktu tidak valid.\nGunakan contoh: 1h, 30m, 1d, dsb.' }, { quoted: msg });
        }
        groupData.gbFilter.close = { active: true, until: Date.now() + duration };
        saveDB();
        return conn.sendMessage(chatId, { text: `Grup akan ditutup otomatis dalam *${args[0]}*.` }, { quoted: msg });
      }

      await conn.groupSettingUpdate(chatId, 'announcement');
      return conn.sendMessage(chatId, { text: 'Grup berhasil ditutup.' }, { quoted: msg });

    } catch (err) {
      console.error('Close Group Error:', err);
      return conn.sendMessage(chatId, { text: 'Gagal memproses perintah. Coba lagi nanti.' }, { quoted: msg });
    }
  }
};