var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var serverPort = process.env.PORT || 3000
app.listen(serverPort, function () {
  console.log('Honeybeacon listening on port ' + serverPort);
});
