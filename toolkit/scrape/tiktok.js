const axios = require('axios');
const qs = require('qs');

async function getTiktokVideo(url) {
  try {
    const { data } = await axios.post(
      'https://tikwm.com/api/',
      qs.stringify({
        url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://tikwm.com/'
        }
      }
    );

    if (data.code !== 0) {
      throw new Error('Gagal mengambil data dari TikTok.');
    }

    return data.data;
  } catch (error) {
    throw error;
  }
}

module.exports = { getTiktokVideo };