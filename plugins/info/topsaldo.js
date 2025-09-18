export default {
  name: 'Top Uang',
  command: ['topuang', 'topsaldo', 'topmoney'],
  tags: 'Info Menu',
  desc: 'Menampilkan 10 besar pemegang uang terbanyak',
  prefix: true,
  premium: false,

  run: async (conn, msg, { chatInfo }) => {
    const { chatId } = chatInfo
    try {
      const db = getDB()
      const users = Object.entries(db.Private || {})
        .map(([name, data]) => ({
          name,
          uang: data?.money?.amount || 0
        }))
        .sort((a, b) => b.uang - a.uang)
        .slice(0, 10)

      if (!users.length) {
        return conn.sendMessage(chatId, { text: 'Belum ada data uang di database.' }, { quoted: msg })
      }

      const teks = users
        .map((u, i) => `${i + 1}. ${u.name} - Rp: ${u.uang.toLocaleString('id-ID')}`)
        .join('\n')

      await conn.sendMessage(chatId, { text: `*🏆 Top 10 Pemegang Uang Terbanyak 🏆*\n\n${teks}` }, { quoted: msg })
    } catch (e) {
      console.error('[PLUGIN][topuang]', e)
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mengambil data top uang.' }, { quoted: msg })
    }
  }
}