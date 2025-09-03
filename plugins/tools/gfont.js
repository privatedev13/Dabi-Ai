const fonts = {
  monoupper: {
    normal: "abcdefghijklmnopqrstuvwxyz1234567890@#$_&-+()/",
    fancy:  "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ1234567890@#$_&-+()/"
  },
  manuscript: {
    normal: "abcdefghijklmnopqrstuvwxyz1234567890@#$_&-+()/",
    fancy:  "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎@#$_&-+()/"
  },
  handwriting: {
    normal: "abcdefghijklmnopqrstuvwxyz1234567890@#$_&-+()/",
    fancy: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏1234567890@#$_&-+()/"
  }
}

const convert = (txt, font) => {
  const f = fonts[font]; if (!f) return null;
  return [...txt.toLowerCase()].map(ch => {
    let i = f.normal.indexOf(ch); return i >= 0 ? f.fancy[i] : ch;
  }).join("");
}

module.exports = {
  name: 'fontgenerator',
  command: ['gfont', 'fontgenerator'],
  tags: 'tools',
  desc: 'Generate text with fancy fonts',
  prefix: true,

  run: async (conn, msg, { chatInfo, args }) => {
    const { chatId } = chatInfo;
    try {
      if (!args.length) {
        return conn.sendMessage(chatId, { 
          text: `Daftar font tersedia:\n- ${Object.keys(fonts).join("\n- ")}\n\nUsage: .gfont <fontname> <text>` 
        }, { quoted: msg });
      }

      if (args.length < 2)
        return conn.sendMessage(chatId, { text: `Usage: .gfont <fontname> <text>` }, { quoted: msg });

      const res = convert(args.slice(1).join(" "), args[0].toLowerCase());
      await conn.sendMessage(chatId, { text: res || `Font "${args[0]}" tidak tersedia.` }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg });
    }
  }
}
