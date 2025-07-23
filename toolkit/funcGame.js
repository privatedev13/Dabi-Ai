const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const p = path.join(__dirname, './db/game.json');
const tokoPath = path.join(__dirname, './db/datatoko.json');

const load = (f = p, d = {}) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : d;
const save = (v, f = p) => fs.writeFileSync(f, JSON.stringify(v, null, 2));
const bersih = (d = {}) => {
  for (const k in d) if (!d[k]?.status) delete d[k];
  return d;
};

const loadToko = () => fs.existsSync(tokoPath) ? JSON.parse(fs.readFileSync(tokoPath)) : { pendingOrders: [] };
const saveToko = data => fs.writeFileSync(tokoPath, JSON.stringify(data, null, 2));

async function handleGame(conn, msg, chatId, text) {
  try {
    const replyId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const nomor = (msg.key.participant || msg.key.remoteJid || '').replace(/\D/g, '') + '@s.whatsapp.net';
    const dbUser = getDB();
    const userKey = Object.keys(dbUser.Private).find(k => dbUser.Private[k].Nomor === nomor);
    const tokoData = loadToko();
    const jawaban = text.toLowerCase().trim();
    const pendingIndex = tokoData.pendingOrders.findIndex(o => o.chance?.id === nomor);

    if (pendingIndex !== -1) {
      const order = tokoData.pendingOrders[pendingIndex].chance;
      if (['ya', 'iya'].includes(jawaban)) {
        const gameDb = load();
        const user = dbUser.Private[userKey];
        if (user && (user.money?.amount || 0) >= 30000) {
          user.money.amount -= 30000;
          if (gameDb[order.idKey]) {
            gameDb[order.idKey].chance = (gameDb[order.idKey].chance || 0) + order.barang;
          }
          tokoData.pendingOrders.splice(pendingIndex, 1);
          saveToko(tokoData);
          save(gameDb);
          global.saveDB(dbUser);
          await conn.sendMessage(chatId, { text: `Pembelian berhasil. 3 kesempatan ditambahkan.\nSisa saldo: Rp${user.money.amount.toLocaleString('id-ID')}` }, { quoted: msg });
        } else {
          await conn.sendMessage(chatId, { text: `Saldo kurang atau kamu belum terdaftar.` }, { quoted: msg });
        }
        return true;
      } else if (['tidak', 'no'].includes(jawaban)) {
        tokoData.pendingOrders.splice(pendingIndex, 1);
        saveToko(tokoData);
        await conn.sendMessage(chatId, { text: `Pembelian dibatalkan.` }, { quoted: msg });
        return true;
      }
    }

    if (!replyId) return false;

    const db = load();
    const key = Object.keys(db).find(k => db[k].id === replyId);
    if (!key) return false;

    if (!userKey) {
      await conn.sendMessage(chatId, { text: 'Kamu belum daftar. Ketik *.daftar* untuk mulai.' }, { quoted: msg });
      return true;
    }

    const user = dbUser.Private[userKey];
    const item = db[key];
    const ansArr = Array.isArray(item.jawaban || item.data?.jawaban) ? item.jawaban || item.data?.jawaban : [item.jawaban || item.data?.jawaban];
    const answers = ansArr.map(j => String(j).toLowerCase());
    const benar = answers.includes(jawaban);

    if (benar) {
      const bonus = 10000;
      user.money = user.money || {};
      user.money.amount = (user.money.amount || 0) + bonus;
      await conn.sendMessage(chatId, { text: `Jawaban benar. Kamu dapat Rp10.000.` }, { quoted: msg });
      delete db[key];
      global.saveDB(dbUser);
    } else {
      item.chance = (item.chance || 3) - 1;
      if (item.chance <= 0) {
        await conn.sendMessage(chatId, { text: `Kesempatan habis. Jawaban benar: ${answers.join(', ')}` }, { quoted: msg });
        delete db[key];
      } else if (item.chance === 1) {
        tokoData.pendingOrders.push({
          chance: { idKey: key, barang: 3, status: true, id: nomor }
        });
        saveToko(tokoData);
        await conn.sendMessage(chatId, {
          text: `Kesempatan tersisa 1. Mau beli 3 kesempatan seharga Rp30.000?\nBalas *ya* untuk beli, *tidak* untuk batal.`
        }, { quoted: msg });
        db[key] = item;
      } else {
        await conn.sendMessage(chatId, { text: `Jawaban salah. Sisa kesempatan: ${item.chance}` }, { quoted: msg });
        db[key] = item;
      }
    }

    save(db);
    return true;
  } catch (err) {
    console.error(chalk.redBright('[ERROR] handleGame:'), err);
    return false;
  }
}

module.exports = { handleGame, load, save, bersih, p };