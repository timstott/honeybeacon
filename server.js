'use strict';

import * as github from './lib/github.js'
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

app.get('/devices', (req, res) => {
  github.fetchGist().catch(err => {
    res.send(`${err.message}\n${noFaultsFoundCode}\n`);
  });
});

if (!module.parent) {
  app.listen(serverPort, () => {
    console.log(`Honeybeacon listening on port ${serverPort}`);
  });
}

module.exports = app;
