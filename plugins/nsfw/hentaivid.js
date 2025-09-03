/*
* Source Code By: Danzz
* ch: https://whatsapp.com/channel/0029Vb9CW9bJUM2etAkmmC2q
*/

const axios = require('axios')
const path = require('path')
const fs = require('fs')
const fsp = require('fs/promises')
const { fetchHentaivid } = require('../../toolkit/scrape/hentaivid')

const TMP = path.join(__dirname, '../../temp')

if (!fs.existsSync(TMP)) {
  console.log("Folder temp tidak ada")
}

module.exports = {
  name: 'hentaivid',
  command: ['hentaivid'],
  tags: 'Nsfw Menu',
  desc: 'Mengambil video hentai random dari API',
  prefix: true,
  premium: true,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo
    if (!(await isPrem(module.exports, conn, msg))) return;

    let file = null
    try {
      const url = await fetchHentaivid()
      const res = await axios({ method: 'GET', url, responseType: 'stream' })
      const filename = `hentaivid_${Date.now()}.mp4`
      file = path.join(TMP, filename)
      const writer = fs.createWriteStream(file)
      res.data.pipe(writer)
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
      await conn.sendMessage(chatId, { video: { url: file } }, { quoted: msg })
    } catch (e) {
      conn.sendMessage(chatId, { text: `Error: ${e.message}` }, { quoted: msg })
    } finally {
      if (file) {
        try { await fsp.unlink(file) } 
        catch (err) { console.error("Gagal hapus file temp:", err) }
      }
    }
  }
}