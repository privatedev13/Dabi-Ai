const fs = require('fs');
const os = require('os');
const path = require('path');
const Crypto = require('crypto');
const ff = require('fluent-ffmpeg');
const webp = require('node-webpmux');
const { spawn, exec } = require('child_process');
const axios = require('axios');

function imageToWebp(media) {
    return new Promise((resolve, reject) => {
        const tmpFileOut = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
        const tmpFileIn = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);

        fs.writeFileSync(tmpFileIn, media);

        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => {
                const buff = fs.readFileSync(tmpFileOut);
                fs.unlinkSync(tmpFileOut);
                fs.unlinkSync(tmpFileIn);
                resolve(buff);
            })
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });
}

function videoToWebp(media) {
    return new Promise((resolve, reject) => {
        const tmpFileOut = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
        const tmpFileIn = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);

        fs.writeFileSync(tmpFileIn, media);

        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => {
                const buff = fs.readFileSync(tmpFileOut);
                fs.unlinkSync(tmpFileOut);
                fs.unlinkSync(tmpFileIn);
                resolve(buff);
            })
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop", "0",
                "-ss", "00:00:00",
                "-t", "00:00:05",
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut);
    });
}

async function writeExifImg(media, metadata, converted) {
    let wMedia = converted ? media : await imageToWebp(media);
    const tmpFileIn = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, wMedia);

    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            "sticker-pack-id": `https://github.com/MaouDabi0`,
            "sticker-pack-name": metadata.packname,
            "sticker-pack-publisher": metadata.author,
            "emojis": metadata.categories ? metadata.categories : [""]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        await img.load(tmpFileIn);
        fs.unlinkSync(tmpFileIn);
        img.exif = exif;
        await img.save(tmpFileOut);
        return tmpFileOut;
    }
}

async function writeExifVid(media, metadata, converted) {
    let wMedia = converted ? media : await videoToWebp(media);
    const tmpFileIn = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path.join(os.tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, wMedia);

    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            "sticker-pack-id": `https://github.com/MaouDabi0`,
            "sticker-pack-name": metadata.packname,
            "sticker-pack-publisher": metadata.author,
            "emojis": metadata.categories ? metadata.categories : [""]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        await img.load(tmpFileIn);
        fs.unlinkSync(tmpFileIn);
        img.exif = exif;
        await img.save(tmpFileOut);
        return tmpFileOut;
    }
}

async function generateQuotly(text, name, color = '') {
  try {
    const url = `https://apizell.web.id/tools/qc?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}`;
    const response = await axios.get(url, {
      headers: { "Accept": "application/json" },
      timeout: 30000
    });

    if (!response.data?.status) {
      const message = response.data?.message || "Terjadi kesalahan.";
      throw new Error(message);
    }

    const base64Image = response.data?.result?.image;
    if (!base64Image) {
      throw new Error("Gambar tidak tersedia dalam respons.");
    }

    return Buffer.from(base64Image, "base64");
  } catch (error) {
    throw new Error(`Gagal membuat kutipan:\n${error.message}`);
  }
}

async function convertToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const tmpPath = path.join(tmpdir(), `quote_${Date.now()}.png`);
    const outputPath = path.join(tmpdir(), `quote_${Date.now()}.webp`);

    try {
      writeFileSync(tmpPath, buffer);

      exec(
        `ffmpeg -i "${tmpPath}" -vf "scale=512:-1:flags=lanczos" -c:v libwebp -lossless 1 -qscale 100 "${outputPath}"`,
        (err) => {
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

module.exports = {
    writeExifImg,
    writeExifVid,
    generateQuotly,
    convertToWebp,
    sendImageAsSticker
};