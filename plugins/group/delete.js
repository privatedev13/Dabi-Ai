export default {
  name: 'delete',
  command: ['d', 'del'],
  tags: 'Group Menu',
  desc: 'Menghapus pesan pengguna di group',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    try {
      const { chatId, senderId, isGroup } = chatInfo;
      if (!isGroup) return conn.sendMessage(chatId, { text: "Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: msg });

      const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
      const quotedMessage = contextInfo?.quotedMessage;
      const quotedKey = contextInfo?.stanzaId;
      const quotedSender = contextInfo?.participant;

      if (!quotedMessage || !quotedKey || !quotedSender) {
        return conn.sendMessage(chatId, { text: "Harap kutip pesan yang ingin dihapus!" }, { quoted: msg });
      }

      const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isQuotedFromBot = quotedSender === botId;

      const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);

      if (!isQuotedFromBot && !userAdmin) {
        return conn.sendMessage(chatId, { text: 'Kamu bukan admin dan hanya bisa menghapus pesan dari bot.' }, { quoted: msg });
      }
      if (!isQuotedFromBot && !botAdmin) {
        return conn.sendMessage(chatId, { text: 'Bot bukan admin, tidak bisa menghapus pesan pengguna lain.' }, { quoted: msg });
      }

      await conn.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: isQuotedFromBot,
          id: quotedKey,
          ...(isQuotedFromBot ? {} : { participant: quotedSender })
        }
      });

    } catch (error) {
      console.error('Delete command error:', error);
      conn.sendMessage(msg.key.remoteJid, { text: "Gagal menghapus pesan." }, { quoted: msg });
    }
  }
};