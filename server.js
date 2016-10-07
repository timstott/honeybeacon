'use strict';

import express from 'express';
import https from 'https';
const app = express();
const serverPort = process.env.PORT || 3000;

const noFaultsFoundCode = 0;

app.use((_, res, next) => {
  res.set('Content-Type', 'text/plain')
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/ping', (_, res) => { res.send("pong\n"); });


const fetchGist = (gistId) => {
  return new Promise((_, reject) => {
    const gistId  = process.env.CONFIG_GIST_ID;
    const gistUrl = `https://api.github.com/gists/${gistId}`;

    makeGetRequest(gistUrl).catch(err => {
      reject(new Error('Failed to fetch gist'));
    });
  });
};

const makeGetRequest = (url) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      const {statusCode} = response;

      if (statusCode != 200) {
        const errorMessage = `Failed GET request ${url}. Response status code ${statusCode}`;
        console.log(errorMessage);
        reject(new Error(errorMessage));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
};

app.get('/devices', (req, res) => {
  fetchGist().catch(err => {
    res.send(`${err.message}\n${noFaultsFoundCode}\n`);
  });
});

if (!module.parent) {
  app.listen(serverPort, () => {
    console.log(`Honeybeacon listening on port ${serverPort}`);
  });
}

module.exports = app;
