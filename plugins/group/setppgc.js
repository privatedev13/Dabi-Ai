import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
  name: 'setppgc',
  command: ['setppgc', 'setfotogc'],
  tags: 'Group Menu',
  desc: 'Mengatur foto profil group',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText
  }) => {
    const { chatId, senderId, isGroup } = chatInfo;
    if (!isGroup) {
      return conn.sendMessage(chatId, { text: 'Perintah ini hanya bisa digunakan dalam grup' }, { quoted: msg });
    }

    const { botAdmin, userAdmin } = await exGrup(conn, chatId, senderId);
    if (!userAdmin) {
      return conn.sendMessage(chatId, { text: 'Kamu bukan Admin' }, { quoted: msg });
    }
    if (!botAdmin) {
      return conn.sendMessage(chatId, { text: 'Bot bukan admin' }, { quoted: msg });
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageSource = quotedMsg?.imageMessage || msg.message?.imageMessage;

    if (!imageSource) {
      return conn.sendMessage(chatId, {
        text: `Kirim atau balas gambar dengan caption *${prefix}${commandText}* untuk mengubah foto grup`
      }, { quoted: msg });
    }

    try {
      const buffer = await downloadMediaMessage({ message: quotedMsg || msg.message }, 'buffer', {});
      if (!buffer) throw new Error('Gagal mengunduh gambar');

      await conn.updateProfilePicture(chatId, buffer);
      conn.sendMessage(chatId, { text: 'Foto profil grup berhasil diperbarui' }, { quoted: msg });
    } catch (e) {
      console.error('Error setppgc:', e);
      conn.sendMessage(chatId, { text: `Gagal mengubah foto grup: ${e.message}` }, { quoted: msg });
    }
  }
};