export default {
  name: 'Rampok',
  command: ['rampok'],
  tags: 'Rpg Menu',
  desc: 'Merampok saldo pengguna lain',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    prefix,
    commandText,
    args
  }) => {
    const { chatId, senderId } = chatInfo
    const ctx = msg.message?.extendedTextMessage?.contextInfo

    if (!args.length && !ctx) {
      return conn.sendMessage(chatId, { text: `Gunakan format:\n\n${prefix}${commandText} @tag\n${prefix}${commandText} 628xxxx\nBalas pesan lalu ketik ${prefix}${commandText}` }, { quoted: msg })
    }

    try {
      initDB()
      const db = getDB()
      const dbUser = db.Private

      let target = ctx?.mentionedJid?.[0] || ctx?.participant
      if (!target && args.length) {
        const num = args.find(a => /^\d{8,}$/.test(a))
        if (num) target = num.replace(/\D/g, '') + '@s.whatsapp.net'
      }
      if (!target?.endsWith('@s.whatsapp.net')) return conn.sendMessage(chatId, { text: 'Nomor tidak valid atau tidak ditemukan' }, { quoted: msg })

      target = target.toLowerCase().trim()
      if (target === senderId) return conn.sendMessage(chatId, { text: 'Tidak bisa merampok diri sendiri' }, { quoted: msg })

      const pelakuKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === senderId)
      const targetKey = Object.keys(dbUser).find(k => dbUser[k].Nomor === target)
      if (!pelakuKey) return conn.sendMessage(chatId, { text: 'Kamu belum terdaftar di database' }, { quoted: msg })
      if (!targetKey) return conn.sendMessage(chatId, { text: 'Target belum terdaftar di database' }, { quoted: msg })

      const pelaku = dbUser[pelakuKey], korban = dbUser[targetKey]
      if (pelaku.jail) return conn.sendMessage(chatId, { text: 'Kamu sedang di penjara dan tidak bisa merampok.' }, { quoted: msg })

      const game = load()
      if (!game.historyGame[senderId]) game.historyGame[senderId] = {}
      const hist = game.historyGame[senderId]
      const now = Date.now()
      if (!hist.rampokCount) hist.rampokCount = 0
      if (!hist.rampokReset) hist.rampokReset = now
      if (now - hist.rampokReset >= 30 * 60 * 1000) { hist.rampokCount = 0; hist.rampokReset = now }
      if (hist.rampokCount >= 10) {
        const menit = Math.ceil((30 * 60 * 1000 - (now - hist.rampokReset)) / 60000)
        return conn.sendMessage(chatId, { text: `Limit rampok kamu sudah habis. Tunggu ${menit} menit lagi untuk reset.` }, { quoted: msg })
      }

      pelaku.money = pelaku.money || { amount: 0 }
      korban.money = korban.money || { amount: 0 }
      if (korban.money.amount <= 0) return conn.sendMessage(chatId, { text: 'Target tidak punya uang untuk dirampok' }, { quoted: msg })

      hist.rampokCount++
      save(game)

      const success = Math.random() < 0.5
      const maxRampok = Math.min(korban.money.amount, 10000)
      const hasil = Math.floor(Math.random() * maxRampok) + 1000

      if (success) {
        korban.money.amount -= hasil
        pelaku.money.amount += hasil
        saveDB(db)
        return conn.sendMessage(chatId, { text: `Berhasil merampok Rp${hasil.toLocaleString('id-ID')} dari target\nSisa limit rampok: ${10 - hist.rampokCount}` }, { quoted: msg })
      }

      if (Math.random() < 0.3) {
        pelaku.jail = true
        saveDB(db)
        return conn.sendMessage(chatId, { text: 'Rampok gagal. Kamu tertangkap dan masuk penjara!' }, { quoted: msg })
      }

      saveDB(db)
      return conn.sendMessage(chatId, { text: `Rampok gagal. Target berhasil kabur\nSisa limit rampok: ${10 - hist.rampokCount}` }, { quoted: msg })
    } catch (err) {
      console.error('Error rampok.js:', err)
      return conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat merampok' }, { quoted: msg })
    }
  }
}