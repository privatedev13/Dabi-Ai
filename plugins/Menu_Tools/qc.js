const axios = require('axios');
const uploadImage = require('../../toolkit/scrape/uploadImage.js');
const { webp2png } = require('../../toolkit/scrape/webp2mp4.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeFileSync, readFileSync, unlinkSync } = require('fs');
const { tmpdir } = require('os');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
  name: 'qc',
  command: ['qc', 'quoted', 'quotly'],
  tags: 'Tools Menu',
  desc: 'Membuat quoted stiker',

  async run(conn, message, { isPrefix }) {
    const parsed = parseMessage(message, isPrefix);
    if (!parsed) return;

    const { chatId, isGroup, senderId, textMessage, prefix, commandText, args, pushName } = parsed;

    if (!module.exports.command.includes(commandText)) return;

    if (textMessage.length > 100) return conn.sendMessage(chatId, { text: "Maksimal 100 karakter!" });

    let ppKosong = "https://nauval.mycdn.biz.id/download/1738516198286.jpeg"; 
    let pp = await conn.profilePictureUrl(senderId, "image").catch(() => ppKosong);

    conn.sendMessage(chatId, { react: { text: "🕛", key: message.key } });

    const text = args.join(" ") || textMessage;
    const words = text.split(" ").length;
    const charCount = text.length;
    const lineCount = Math.ceil(charCount / 20);

    let width = Math.min(600 + words * 12, 850);
    let height = Math.min(300 + lineCount * 40, 500);

    let obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#ffffffff",
      width,
      height,
      scale: 3,
      messages: [
        {
          entities: [],
          avatar: true,
          from: { 
            id: 1, 
            name: pushName || 'User',
            photo: { url: pp } 
          },
          text,
          replyMessage: {},
        },
      ],
    };

    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
      const quotedType = Object.keys(quotedMessage)[0];

      if (quotedType === "conversation" || quotedType === "extendedTextMessage") {
        const quotedText = quotedMessage[quotedType].text || "";
        obj.messages[0].replyMessage = {
          name: await conn.getName(message.message.extendedTextMessage.contextInfo.participant),
          text: quotedText,
          chatId: chatId.split("@")[0],
        };
      } else if (quotedType === "stickerMessage" || quotedType === "imageMessage") {
        try {
          let img = await downloadMediaMessage(quotedMessage);
          let up = quotedType === "stickerMessage" ? await webp2png(img) : await uploadImage(img);
          obj.messages[0].media = { url: up };
        } catch (e) {
          console.error('Error processing media:', e);
        }
      }
    }

    try {
      const buffer = await generateQuotly(obj);
      const webpBuffer = await convertToWebp(buffer, width, height);
      await sendImageAsSticker(conn, chatId, webpBuffer, message);
    } catch (error) {
      console.error('Error in quoted sticker creation:', error);
      conn.sendMessage(chatId, { text: "Gagal membuat kutipan." });
    }
  },
};

async function generateQuotly(obj) {
  try {
    // Encode the text and name parameters
    const encodedText = encodeURIComponent(obj.messages[0].text);
    const encodedName = encodeURIComponent(obj.messages[0].from.name);
    
    const response = await axios.post(
      `https://apizell.web.id/tools/qc?text=${encodedText}&name=${encodedName}`,
      obj,
      {
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!response.data?.result?.image) {
      throw new Error("Invalid response format or no image result found");
    }
    return Buffer.from(response.data.result.image, "base64");
  } catch (error) {
    console.error("Quotly API error:", error);
    throw new Error("Failed to generate the quote image.");
  }
}

async function convertToWebp(buffer, width, height) {
  return new Promise((resolve, reject) => {
    const tmpPath = path.join(tmpdir(), `quote_${Date.now()}.png`);
    const outputPath = path.join(tmpdir(), `quote_${Date.now()}.webp`);
    
    try {
      writeFileSync(tmpPath, buffer);

      exec(
        `ffmpeg -i "${tmpPath}" -vf "scale=${width}:${height}:flags=lanczos" -c:v libwebp -lossless 1 -qscale 100 "${outputPath}"`,
        (err) => {
          // Clean up temp files
          try { unlinkSync(tmpPath); } catch (e) {}
          
          if (err) {
            try { unlinkSync(outputPath); } catch (e) {}
            return reject(err);
          }
          
          try {
            const result = readFileSync(outputPath);
            unlinkSync(outputPath);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
}

async function sendImageAsSticker(conn, chatId, webpBuffer, message) {
  try {
    await conn.sendMessage(chatId, { 
      sticker: webpBuffer,
      mimetype: "image/webp",
      packname: "Dabi Chan",
      author: "Quoted Sticker"
    }, { quoted: message });
  } catch (error) {
    console.error('Error sending sticker:', error);
    throw error;
  }
}