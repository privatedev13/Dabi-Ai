const fetch = require('node-fetch');

async function gpt4(text) {
  const apiUrl = `${global.zellApi}/ai/blackbox`;

  try {
    const res = await fetch(`${apiUrl}?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (json?.status === 'success' && json?.result) {
      return json.result;
    } else {
      return 'Terjadi kesalahan saat mengambil data.';
    }
  } catch (e) {
    console.error("Error in gpt4():", e.message);
    return 'Terjadi kesalahan koneksi atau server tidak merespons.';
  }
}

module.exports = gpt4;