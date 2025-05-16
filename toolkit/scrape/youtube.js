const axios = require('axios');

async function ytMp3(url) {
  try {
    const api = url.includes('shorts/')
      ? 'https://apizell.web.id/download/youtube2'
      : 'https://apizell.web.id/download/youtube';

    const res = await axios.get(`${api}?url=${encodeURIComponent(url)}&format=mp3`);
    const data = res.data;

    if (!data?.success) {
      throw new Error(data.message || 'Gagal mendapatkan data dari API.');
    }

    return {
      title: data.title,
      thumb: data.thumbnail,
      url: data.download
    };
  } catch (err) {
    throw new Error('Gagal mengambil link MP3: ' + err.message);
  }
}

async function ytMp4(url) {
  try {
    const api = url.includes('shorts/')
      ? 'https://apizell.web.id/download/youtube2'
      : 'https://apizell.web.id/download/youtube';

    const res = await axios.get(`${api}?url=${encodeURIComponent(url)}&format=720`);
    const data = res.data;

    if (!data?.success) {
      throw new Error(data.message || 'Gagal mendapatkan data dari API.');
    }

    return {
      title: data.title,
      thumb: data.thumbnail,
      url: data.download
    };
  } catch (err) {
    throw new Error('Gagal mengambil link MP4: ' + err.message);
  }
}

module.exports = {
  ytMp3,
  ytMp4
};