'use strict';
const express = require('express');
const router = express.Router();
const auctionsController = require('../controllers').auctions;
const AuthMiddleWare = require('../middlewares').auth;

router.use(AuthMiddleWare);

router.get('/', auctionsController.getCurrent);

router.post('/start', auctionsController.startNew);

router.post('/bid', auctionsController.placeBid);

router.post('/end', auctionsController.endAuction);

router.post('/check', auctionsController.checkQueue);

module.exports = router;
