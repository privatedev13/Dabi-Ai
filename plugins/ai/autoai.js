export default {
  name: 'autoai',
  command: ['autoai', 'ai'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan ai',
  prefix: true,
  owner: false,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      const db = getDB();
      const input = args[0]?.toLowerCase();

      if (!['on', 'off'].includes(input)) {
        return conn.sendMessage(chatId, { text: `Gunakan format: ${prefix + commandText} <on/off>` }, { quoted: msg });
      }

      const status = input === 'on';
      const target = isGroup ? 'Grup' : 'Private';
      const idKey = isGroup ? 'Id' : 'Nomor';
      const idVal = isGroup ? chatId : senderId;

      const key = Object.keys(db[target]).find(k => db[target][k][idKey] === idVal);
      if (!key) {
        return conn.sendMessage(chatId, { text: `${isGroup ? 'Grup' : 'Nomor kamu'} belum terdaftar dalam database.` }, { quoted: msg });
      }

      db[target][key].autoai = status;
      saveDB();

      const teks = `Fitur Auto-AI untuk ${isGroup ? 'grup ini' : 'kamu'} telah *${status ? 'diaktifkan' : 'dinonaktifkan'}*.`;
      conn.sendMessage(chatId, { text: teks }, { quoted: msg });

    } catch (err) {
      console.error('[autoai]', err);
      conn.sendMessage(chatInfo.chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg });
    }
  }
};