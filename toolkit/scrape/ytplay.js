const axios = require('axios');

async function downloadYoutubeAudio(url) {
  try {
    const apiKey = ytKey;
    const downloadInit = await axios.get(`https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}&api=${apiKey}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!downloadInit.data || !downloadInit.data.success) {
      throw new Error('Gagal menginisialisasi unduhan audio.');
    }

    const { id } = downloadInit.data;

    while (true) {
      const progress = await axios.get(`https://p.oceansaver.in/ajax/progress.php?id=${id}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (progress.data && progress.data.success && progress.data.progress === 1000) {
        return progress.data.download_url;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Error saat downloadYoutubeAudio:', error);
    throw error;
  }
}

module.exports = { downloadYoutubeAudio };