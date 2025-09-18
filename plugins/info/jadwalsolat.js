import getJadwal from '../../toolkit/scrape/jadwalsolat.js';

export default {
  name: 'jadwalsolat',
  command: ['jadwalsolat', 'solat'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau matikan jadwal solat di grup',
  prefix: true,
  premium: false,

  run: async (conn, msg, {
    chatInfo,
    args
  }) => {
    const { chatId, isGroup } = chatInfo;

    try {
      if (!isGroup) {
        return conn.sendMessage(chatId, { text: 'Fitur hanya untuk grup.' }, { quoted: msg });
      }

      if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, { text: 'Gunakan:\n.jadwalsolat on [kota]\n.jadwalsolat off' }, { quoted: msg });
      }

      const db = getDB();
      const g = getGc(db, chatId);
      if (!g) {
        return conn.sendMessage(chatId, { text: 'Grup belum terdaftar di database.' }, { quoted: msg });
      }

      if (args[0].toLowerCase() === 'on') {
        const kota = args[1] || "Jakarta";
        const jadwal = await getJadwal(kota);

        if (!jadwal) {
          return conn.sendMessage(chatId, { text: 'Gagal mengambil jadwal solat dari API.' }, { quoted: msg });
        }

        g.jadwalSolat = true;
        saveDB();

        let teks = `Jadwal solat diaktifkan.\n\n`;
        teks += `${head}${Obrack} Jadwal Hari ini ${Cbrack}\n${side}\n`;
        teks += `${side} ${btn} *Lokasi:* ${jadwal.lokasi}\n`;
        teks += `${side} ${btn} *Tanggal:* ${jadwal.tanggal}\n`;
        teks += `${side} ${btn} *Subuh:* ${jadwal.waktu.Fajr}\n`;
        teks += `${side} ${btn} *Dzuhur:* ${jadwal.waktu.Dhuhr}\n`;
        teks += `${side} ${btn} *Ashar:* ${jadwal.waktu.Asr}\n`;
        teks += `${side} ${btn} *Maghrib:* ${jadwal.waktu.Maghrib}\n`;
        teks += `${side} ${btn} *Isya:* ${jadwal.waktu.Isha}\n${side}\n`;
        teks += `${foot}${garis}`

        return conn.sendMessage(chatId, { 
          text: teks
        }, { quoted: msg });

      } else {
        g.jadwalSolat = false;
        saveDB();
        return conn.sendMessage(chatId, { text: 'Jadwal solat dinonaktifkan untuk grup ini.' }, { quoted: msg });
      }

    } catch (e) {
      console.error('Error plugin jadwalsolat:', e);
      conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat memproses perintah.' }, { quoted: msg });
    }
  }
};