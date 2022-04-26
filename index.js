const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const path = require('path');
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: '*'
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
  // ...
});

httpServer.listen(3000);