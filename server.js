'use strict';

import express from 'express';
const app = express();
const serverPort = process.env.PORT || 3000;

app.use((_, res, next) => {
  res.set('Content-Type', 'text/plain')
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/ping', (_, res) => { res.send("pong\n"); });

if(!module.parent){ 
  app.listen(serverPort, () => {
    console.log(`Honeybeacon listening on port ${serverPort}`);
  });
}

module.exports = app;
