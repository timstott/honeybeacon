import https from 'https';
import url from 'url';

export const makeGetRequest = (rawUrl) => {
  const urlOptions = Object.assign({ headers: { 'User-Agent': 'honeybeacon' } },
                                   url.parse(rawUrl));

  return new Promise((resolve, reject) => {
    const request = https.get(urlOptions, (response) => {
      const { statusCode } = response;

      if (statusCode != 200) {
        const errorMessage = `Failed GET request ${rawUrl} Responded with status code ${statusCode}`;
        // TODO: replace with logger
        console.log(errorMessage);
        reject(new Error(errorMessage));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => {
        try {
          resolve(JSON.parse(body.join('')));
        } catch(_) {
          reject(new Error('Unable to parse response as JSON'));
        }
      });
    });
    request.on('error', (err) => reject(err));
  });
}
