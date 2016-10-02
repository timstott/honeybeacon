'use strict';
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const serverPort = process.env.PORT || 3000
app.listen(serverPort, () => {
  console.log(`Honeybeacon listening on port ${serverPort}`);
});
