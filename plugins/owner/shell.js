import { exec } from 'child_process';

export default {
  name: 'Shell',
  command: ['sh', '$', 'shell'],
  tags: 'Owner Menu',
  desc: 'Jalankan perintah shell',
  prefix: false,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId } = chatInfo;
    if (args.length === 0) {
      return conn.sendMessage(chatId, { text: 'Masukkan perintah shell.' }, { quoted: msg });
    }

    const command = args.join(' ');

    exec(command, (err, stdout, stderr) => {
      if (err) {
        return conn.sendMessage(chatId, { text: `Error: ${err.message}` }, { quoted: msg });
      }
      if (stderr) {
        return conn.sendMessage(chatId, { text: `Stderr: ${stderr}` }, { quoted: msg });
      }

      conn.sendMessage(chatId, {
        text: stdout || 'Perintah berhasil tanpa output.'
      }, { quoted: msg });
    });
  }
};