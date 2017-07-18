// server.js
// where your node app starts

// init project
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

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

let delay2 = (time) => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));

app.get("/longpoll/:label", function (request, response) {
  memelog.GetCount(request.params.label)
  .then(function (){
    return delay2(10000);
  })
  .then(function (){
    return response.send("countccssssscVl");
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
