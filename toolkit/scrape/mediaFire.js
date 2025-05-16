const axios = require('axios');

async function meFire(url) {
  if (!/^https?:\/\/(www\.)?mediafire\.com\/file\//.test(url)) {
    throw new Error('URL MediaFire tidak valid!');
  }

  try {
    const response = await axios.get(`https://apizell.web.id/download/mediafire?url=${encodeURIComponent(url)}`);
    const data = response.data;

    if (!data?.status || !data?.metadata || !data?.download) {
      throw new Error('Gagal mendapatkan data dari MediaFire.');
    }

    return {
      name: data.metadata.filename,
      size: data.metadata.size,
      mime: data.metadata.type,
      url: data.download
    };
  } catch (err) {
    throw new Error('Gagal melakukan permintaan ke API MediaFire.');
  }
}

module.exports = { meFire };