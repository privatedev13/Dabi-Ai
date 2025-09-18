import axios from 'axios'
const API_URL = 'https://api.vreden.my.id/api/hentaivid'

async function fetchHentaivid() {
  try {
    const { data } = await axios.get(API_URL)
    if (data.status === 200 && Array.isArray(data.result) && data.result[0]?.video_1) {
      return data.result[0].video_1
    }
    throw new Error(data.message || 'Struktur data tidak sesuai')
  } catch (e) {
    if (e.response) throw new Error(`Server API Error: ${e.response.status} - ${e.response.statusText}`)
    if (e.request) throw new Error('Tidak ada respons dari server API')
    throw new Error(e.message)
  }
}

export default fetchHentaivid;