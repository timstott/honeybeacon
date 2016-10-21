'use strict';

import { makeGetRequest } from './lib/make-https.js';
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
  return new Promise((resolve, reject) => {
    const gistId  = process.env.CONFIG_GIST_ID;
    const gistUrl = `https://api.github.com/gists/${gistId}`;

    makeGetRequest(gistUrl)
      .catch(err => { reject(new Error('Failed to fetch gist')); })
      .then(data => resolve(data));
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
