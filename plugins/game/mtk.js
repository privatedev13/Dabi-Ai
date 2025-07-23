module.exports = {
  name: 'MathQuiz',
  command: ['mtk', 'tesmtk'],
  tags: 'Game Menu',
  desc: 'Jawab soal matematika sederhana!',
  prefix: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo;
    const [num1, num2] = [1, 1].map(() => Math.floor(Math.random() * 100) + 1);
    const op = ['+', '-', '*', '÷'][Math.floor(Math.random() * 4)];

    const opsMap = {
      '+': { result: num1 + num2, symbol: '+' },
      '-': { result: num1 - num2, symbol: '-' },
      '*': { result: num1 * num2, symbol: '×' },
      '÷': { result: (num1 / num2).toFixed(2), symbol: '÷' }
    };

    const { result, symbol } = opsMap[op];
    const question = `${num1} ${symbol} ${num2}`;

    const res = await conn.sendMessage(chatId, {
      text: `Soal MTK: ${question} = ?\n\nBalas pesan ini dengan jawabanmu!`
    }, { quoted: msg });

    const session = global.load(global.pPath);
    const sessionKey = `soal${Object.keys(session).length + 1}`;

    session[sessionKey] = {
      soal: question,
      jawaban: result,
      created: Date.now(),
      id: res.key.id,
      chance: 3
    };

    global.save(session, global.pPath);
  }
};