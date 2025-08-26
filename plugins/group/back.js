const { proto } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'back',
  command: ['bck', 'back'],
  tags: 'Group Menu',
  desc: 'Join grup dari link invite atau kirim pesan promosi jika sudah bergabung',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId, senderId } = chatInfo;

    try {
      const { userAdmin } = await stGrup(conn, chatId, senderId);
      if (!userAdmin) {
        return conn.sendMessage(chatId, { text: 'Kamu bukan Admin!' }, { quoted: msg });
      }

      const contextInfo = msg?.message?.extendedTextMessage?.contextInfo;
      const quoted = contextInfo?.quotedMessage;

      let link = quoted?.extendedTextMessage?.matchedText;
      if (!link) {
        const regex = /(https:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]+)/;
        link = quoted?.extendedTextMessage?.text?.match(regex)?.[0];
      }

      if (!link) {
        return conn.sendMessage(chatId, { text: 'Tidak ada link grup valid yang ditemukan di reply.' }, { quoted: msg });
      }

      const inviteCode = link.split('/')[3].split('?')[0];
      const response = await conn.groupGetInviteInfo(inviteCode);

      if (!response) {
        return conn.sendMessage(chatId, { text: 'Tidak bisa mengambil info grup dari link.' }, { quoted: msg });
      }

      const jid = response.id;
      const groups = Object.keys(conn.groupMetadata ? conn.groupMetadata : {});

      const teks = `ɪᴢɪɴ ᴍɪɴ 
ɢᴀʙᴜɴɢ ʏᴜᴋ ᴅɪ ɢʀᴜᴘ ʙᴏᴛ ᴡᴀ ᴀᴋᴜ! 

ʙᴏᴛ ᴀᴋᴛɪꜰ
* 24/ᴊᴀᴍ 
* ʙɪꜱᴀ ᴜɴᴛᴜᴋ ʙɪꜱɴɪꜱ, ᴏɴʟɪɴᴇ, ᴅᴀɴ ʜɪʙᴜʀᴀɴ 

ʙᴄᴋ ᴛᴀᴅɪ

ᴋʟɪᴋ ʟɪɴᴋ ɴʏᴀ ᴅɪ ʙᴀᴡᴀʜ ɪɴɪ ᴜɴᴛᴜᴋ ɢᴀʙᴜɴɢ: https://chat.whatsapp.com/HWkHNig33fv1nozmxADq38`;

      if (!groups.includes(jid)) {
        await conn.groupAcceptInvite(inviteCode);
        await conn.sendMessage(chatId, { text: `Berhasil join ke grup: ${response.subject}` }, { quoted: msg });
      }

      await conn.sendMessage(jid, { text: teks }, { quoted: msg });
      await conn.sendMessage(chatId, { text: 'Pesan promosi terkirim ke grup tersebut.' }, { quoted: msg });

    } catch (e) {
      return conn.sendMessage(chatId, { text: 'Terjadi error saat memproses link grup.' }, { quoted: msg });
    }
  }
};