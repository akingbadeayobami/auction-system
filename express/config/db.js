'use strict';
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../.env')
});
module.exports = {

  "development": {
    "storage": "./express/data/db-dev.db",
    "dialect": "sqlite",
    "logging": false
  },

  "production": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": "auction",
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "dialect": "mysql",
    "logging": false
  },

  "test": {
    "storage": "./express/data/db-test.db",
    "dialect": "sqlite",
    "logging": false
  }

};
