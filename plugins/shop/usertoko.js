export default {
  name: 'Create Store',
  command: ['ctoko'],
  tags: 'Shop Menu',
  desc: 'Create a store and save to toko.json',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, senderId } = chatInfo;

    if (!args[0]) {
      return conn.sendMessage(chatId, { text: 'Masukkan nama toko.\nContoh:\n.ctoko AyumiStore' }, { quoted: msg });
    }

    const storeName = args.join(' ').trim();
    const db = getDB();
    const user = Object.values(db.Private).find(u => u.Nomor === senderId);

    if (!user) {
      return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database.' }, { quoted: msg });
    }

    const storeData = loadStore();

    const sameStore = Object.entries(storeData.shops).find(([name, data]) =>
      name.toLowerCase() === storeName.toLowerCase() && data.owner === senderId
    );

    if (sameStore) {
      return conn.sendMessage(chatId, {
        text: `Kamu sudah memiliki toko bernama *${storeName}*. Gunakan nama lain.`
      }, { quoted: msg });
    }

    storeData.shops[storeName] = {
      id: user.noId,
      owner: senderId,
      items: {},
      balanceId: 0
    };

    saveStore(storeData);

    await conn.sendMessage(chatId, {
      text: `Toko *${storeName}* berhasil dibuat!\nID: ${user.noId}\nPemilik: @${senderId.replace(/@s\.whatsapp\.net$/, '')}`,
      mentions: [senderId]
    }, { quoted: msg });
  }
};