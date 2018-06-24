'use strict';
const express = require('express');
const router = express.Router();
const inventoriesController = require('../controllers').inventories;
const AuthMiddleWare = require('../middlewares').auth;

router.use(AuthMiddleWare);

router.get('/', inventoriesController.getMine);

module.exports = router;
