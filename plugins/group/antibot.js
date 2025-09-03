module.exports = {
  name: 'antibot',
  command: ['antibot'],
  tags: 'Group Menu',
  desc: 'Mengaktifkan atau menonaktifkan filter antibot',
  prefix: true,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;

    if (!isGroup) 
      return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: msg });

    const groupData = gcData(getDB(), chatId);
    if (!groupData) 
      return conn.sendMessage(chatId, { text: `Grup belum terdaftar di database.\nGunakan *${prefix}daftargc* untuk mendaftar.` }, { quoted: msg });

    const { botAdmin, userAdmin } = await stGrup(conn, chatId, senderId);
    if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
    if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

    const input = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(input)) 
      return conn.sendMessage(chatId, { text: `Penggunaan:\n${prefix}${commandText} <on/off>` }, { quoted: msg });

    groupData.gbFilter ??= {};
    groupData.gbFilter.antibot = input === 'on';
    saveDB();

    return conn.sendMessage(chatId, { text: `Fitur antibot berhasil di-${input === 'on' ? 'aktifkan' : 'nonaktifkan'}.` }, { quoted: msg });
  }
};