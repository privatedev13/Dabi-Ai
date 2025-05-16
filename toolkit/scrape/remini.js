const FormData = require('form-data');
const Jimp = require('jimp');

async function remini(imageBuffer, mode) {
  return new Promise(async (resolve, reject) => {
    let validModes = ['enhance', 'recolor', 'dehaze'];
    
    if (!validModes.includes(mode)) {
      mode = 'enhance';
    }
    
    let form = new FormData();
    let apiUrl = 'https://inferenceengine.vyro.ai/' + mode;
    
    form.append('model_version', 1, {
      'Content-Transfer-Encoding': 'binary',
      'contentType': 'multipart/form-data; charset=uttf-8'
    });
    
    form.append('image', Buffer.from(imageBuffer), {
      'filename': 'enhance_image_body.jpg',
      'contentType': 'image/jpeg'
    });
    
    form.submit({
      'url': apiUrl,
      'host': 'inferenceengine.vyro.ai',
      'path': '/' + mode,
      'protocol': 'https:',
      'headers': {
        'User-Agent': 'okhttp/4.9.3',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
      }
    }, function (error, response) {
      if (error) {
        return reject();
      }
      
      let chunks = [];
      response.on('data', function (chunk) {
        chunks.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      response.on('error', err => {
        reject();
      });
    });
  });
}

module.exports = remini;