export default {
  run: async (conn, msg, { chatInfo }, menuText) => {
    await conn.sendMessage(chatInfo.chatId, {
      text: menuText
    }, {
      quoted: msg
    });
  }
}