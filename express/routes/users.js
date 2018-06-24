'use strict';
const express = require('express');
const router = express.Router();
const usersController = require('../controllers').users;

router.post('/authenticate', usersController.authenticate);

router.post('/check', usersController.checkToken);

router.delete('/token/:token', usersController.clearToken);

module.exports = router;
