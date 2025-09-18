export default {
  name: 'antibadword',
  command: ['badword', 'antibadword'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur anti badword dalam grup',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) return conn.sendMessage(chatId, { text: 'Perintah ini hanya untuk grup!' }, { quoted: msg });

    const groupData = getGc(getDB(), chatId);
    if (!groupData) return conn.sendMessage(chatId, { text: `Grup belum terdaftar.\nGunakan *${prefix}daftargc*.` }, { quoted: msg });

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
    if (!userAdmin) return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
    if (!botAdmin) return conn.sendMessage(chatId, { text: 'Bot bukan admin!' }, { quoted: msg });

    const input = args[0]?.toLowerCase();
    groupData.antibadword ??= { badword: false, badwordText: '' };

    if (!input) {
      return conn.sendMessage(chatId, {
        text: `Penggunaan:
${prefix}${commandText} <on/off>
${prefix}${commandText} set <kata>
${prefix}${commandText} reset`
      }, { quoted: msg });
    }

    const send = (text) => conn.sendMessage(chatId, { text }, { quoted: msg });

    switch (input) {
      case 'on':
      case 'off':
        groupData.antibadword.badword = input === 'on';
        saveDB();
        return send(`Fitur antibadword ${input === 'on' ? 'diaktifkan' : 'dinonaktifkan'}.`);

      case 'set': {
        const word = args.slice(1).join(' ').toLowerCase();
        if (!word) return send('Masukkan kata yang ingin ditambahkan.');
        const words = groupData.antibadword.badwordText
          .split(',')
          .map(w => w.trim())
          .filter(Boolean);
        if (words.includes(word)) return send(`Kata "${word}" sudah ada.`);
        words.push(word);
        groupData.antibadword.badwordText = words.join(', ');
        saveDB();
        return send(`Kata "${word}" ditambahkan.`);
      }

      case 'reset':
        groupData.antibadword.badwordText = '';
        saveDB();
        return send('Daftar badword direset.');

      default:
        return send(
          `Perintah tidak dikenal.\nGunakan:\n${prefix}${commandText} <on/off>\n${prefix}${commandText} set <kata>\n${prefix}${commandText} reset`
        );
    }
  }
};