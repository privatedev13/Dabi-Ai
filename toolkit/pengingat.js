const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const file = path.join(__dirname, "db/jadwalsolat.json");

const loadDB = () => {
  if (!fs.existsSync(file)) return { responApi: {}, pengingat: {} };
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!data.pengingat || typeof data.pengingat !== "object" || Array.isArray(data.pengingat)) data.pengingat = {};
    return data;
  } catch {
    return { responApi: {}, pengingat: {} };
  }
};

const saveDB = (data) => {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch {}
};

const getNextJadwal = (responApi) => {
  if (!responApi?.waktu) return null;
  const now = moment(Format.indoTime("Asia/Jakarta", "HH:mm"), "HH:mm");
  for (const [nama, waktu] of Object.entries(responApi.waktu).sort((a, b) =>
    moment(a[1], "HH:mm").diff(moment(b[1], "HH:mm"))
  )) {
    if (moment(waktu, "HH:mm").isSameOrAfter(now)) return { nama, waktu };
  }
  return null;
};

async function cekSholat(conn, msg, { chatId }) {
  const db = loadDB();
  const grupDB = global.getDB?.().Grup || {};
  const grupEntry = Object.entries(grupDB).find(([_, v]) => v.Id === chatId);
  if (!grupEntry) return;

  const [grupName, g] = grupEntry;
  if (!g.jadwalSolat || !db.responApi?.waktu) return;

  const key = chatId, now = moment(Format.indoTime("Asia/Jakarta", "HH:mm"), "HH:mm");
  if (!db.pengingat[key]) {
    const next = getNextJadwal(db.responApi);
    if (next) {
      db.pengingat[key] = {
        id: key,
        name: grupName,
        jadwal: { [next.nama]: db.responApi.waktu[next.nama] },
        time: db.responApi.tanggal || Format.indoTime("Asia/Jakarta", "DD MMM YYYY"),
        notifSent: false
      };
      saveDB(db);
    }
    return;
  }

  const [nama, waktu] = Object.entries(db.pengingat[key].jadwal)[0] || [];
  if (!nama || !waktu) return;

  const waktuMoment = moment(waktu, "HH:mm");
  if (now.isAfter(waktuMoment.clone().add(1, "hours"))) {
    delete db.pengingat[key];
    const next = getNextJadwal(db.responApi);
    if (next) {
      db.pengingat[key] = {
        id: key,
        name: grupName,
        jadwal: { [next.nama]: db.responApi.waktu[next.nama] },
        time: db.responApi.tanggal || Format.indoTime("Asia/Jakarta", "DD MMM YYYY"),
        notifSent: false
      };
    }
    saveDB(db);
    return;
  }

  const batasAkhir = waktuMoment.clone().add(2, "minutes");
  if (now.isBetween(waktuMoment, batasAkhir, null, "[]") && !db.pengingat[key].notifSent) {
    try {
      await conn.sendMessage(chatId, { text: `Waktu *${nama}* telah tiba!\nAyo jangan lupa sholat tepat waktu` }, { quoted: msg });
    } catch {}
    db.pengingat[key].notifSent = true;
    delete db.pengingat[key];
    saveDB(db);
  }
}

module.exports = { cekSholat };