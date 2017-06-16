// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// SPREAD SHEET STUFF
const memelog = require('./meme-log');

app.get("/", function (request, response) {
  memelog.GetTable()
    .then((table) => response.send(table))
});

app.get("/increment/:label", function (request, response) {
  memelog.IncrementCounter(request.params.label)
    .then((table) => response.send(table))
});

app.get("/value/:label", function (request, response) {
  memelog.GetCount(request.params.label)
    .then((countVal) => response.send(countVal))
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
