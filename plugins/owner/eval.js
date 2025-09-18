export default {
  name: 'Eval',
  command: ['>', '=>', '~>'],
  tags: 'Owner Menu',
  desc: 'Mengeksekusi kode JavaScript secara langsung',
  prefix: false,
  owner: true,

  run: async (conn, msg, {
    chatInfo,
    args,
    commandText
  }) => {
    const { chatId } = chatInfo;
    const code = args.join(' ').trim();
    if (!code) return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan kode JavaScript yang ingin dijalankan!' }, { quoted: msg });

    try {
      let result;

      if (commandText === '~>') {
        let logs = [];
        const originalLog = console.log;
        console.log = (...v) => logs.push(v.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' '));

        result = await eval(`(async () => { ${code}; })()`);
        console.log = originalLog;

        const output = [logs.join('\n'), typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)]
          .filter(Boolean).join('\n') || '✅ *Kode dijalankan tanpa output.*';

        return conn.sendMessage(chatId, { text: `✅ *Output:*\n\`\`\`${output}\`\`\`` }, { quoted: msg });

      } else if (commandText === '=>') {
        result = await eval(`(async () => { return (${code}); })()`);
      } else {
        result = await eval(`(async () => { ${code}; })()`);
      }

      const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      await conn.sendMessage(chatId, { text: output && output !== 'undefined' ? output : '✅' }, { quoted: msg });

    } catch (err) {
      conn.sendMessage(chatId, { text: `❌ *Error:* ${err.message}` }, { quoted: msg });
    }
  }
};