export default {
  name: 'restart',
  command: ['restart', 'rt'],
  tags: 'Owner Menu',
  desc: 'Merestart bot',
  prefix: true,
  owner: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 2 detik..." }, { quoted: msg });
    await new Promise(r => setTimeout(r, 2000));
    process.exit(1);
  }
};