"use strict";
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./express/routes/index');
const users = require('./express/routes/users');
const inventories = require('./express/routes/inventories');
const auctions = require('./express/routes/auctions');
const cors = require('cors');
require('dotenv').config({
    path: path.join(__dirname, '../.env')
});

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'jade');
app.set('env', process.env.NODE_ENV || 'development');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './angular')));


app.use('/api', index);
app.use('/api/users', users);
app.use('/api/inventories', inventories);
app.use('/api/auctions', auctions);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const server = require('http').createServer(app);

const io = require('socket.io')(server);

app.set('socketio', io);

module.exports = server;
