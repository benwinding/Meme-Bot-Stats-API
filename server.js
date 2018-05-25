// server.js
// where your node app starts

// init project
const app = require('express')();
const server = require('http').Server(app);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// SPREAD SHEET STUFF
const memelog = require('./meme-log');

app.get("/", async (request, response) => {
    try {
        const table = await memelog.ReturnTable();
        response.send(table);
    } catch (err) {
        response.send(err);
    }
});

app.get("/increment/:label", (request, response) => {
    memelog.IncrementCounter(request.params.label)
        .then((table) => response.send(table))
        .catch((err) => response.send(err));
});

app.get("/value/:label", (request, response) => {
    memelog.GetCount(request.params.label)
        .then((countVal) => response.send(countVal))
        .catch((err) => response.send(err));
});

// listen for requests :)
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('Your app is listening on port ' + port);
});
