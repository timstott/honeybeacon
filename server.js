'use strict';

import * as github from './lib/github.js'
import * as hb from './lib/honeybadger.js'
import express from 'express';
import https from 'https';
const app = express();
const serverPort = process.env.PORT || 3000;

const noFaultsFoundCode = 0;
const faultsFound       = 1;

app.use((_, res, next) => {
  res.set('Content-Type', 'text/plain')
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/ping', (_, res) => { res.send("pong\n"); });

app.get('/devices', (req, res) => {
  const hbAuthToken = process.env.HB_TOKEN;

  github.fetchGist().then(github.parseGist).then((data) => {
    const projectsHaveFaults = data.projects.map((p) => {
      const projectConfig = Object.assign({ authToken: hbAuthToken }, p);
      return hb.projectHasFaults(projectConfig);
    });

    Promise.all(projectsHaveFaults).then((data) => {
      const faultsFound = data.includes(true);

      if (faultsFound) {
        res.send("Faults found\n1\n");
      } else {
        res.send("No faults found\n0\n");
      }
    });
  }).catch(err => {
    res.send(`${err.message}\n${noFaultsFoundCode}\n`);
  });
});

if (!module.parent) {
  app.listen(serverPort, () => {
    console.log(`Honeybeacon listening on port ${serverPort}`);
  });
}

module.exports = app;
