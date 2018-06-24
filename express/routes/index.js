'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send({ title: 'Real Time Auction' });
});

module.exports = router;
