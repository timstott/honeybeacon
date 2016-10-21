import https from 'https';

export const makeGetRequest = (url) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      const { statusCode } = response;

      if (statusCode != 200) {
        const errorMessage = `Failed GET request ${url} Responded with status code ${statusCode}`;
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
