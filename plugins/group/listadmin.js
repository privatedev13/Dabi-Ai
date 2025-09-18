export default {
  name: 'listadmin',
  command: ['listadmin', 'listadmins'],
  tags: 'Group Menu',
  desc: 'Daftar semua admin grup',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId, isGroup } = chatInfo;
      if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });

      const groupMetadata = await conn.groupMetadata(chatId);
      const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

      if (admins.length === 0) return conn.sendMessage(chatId, { text: 'Tidak ada admin di grup ini.' }, { quoted: msg });

      let adminList = '*Daftar Admin Grup:*\n';
      admins.forEach((adminId, i) => {
        adminList += `${i + 1}. @${adminId.split('@')[0]}\n`;
      });

      conn.sendMessage(chatId, { text: adminList, mentions: admins }, { quoted: msg });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Gagal mengambil daftar admin.' }, { quoted: msg });
    }
  }
};