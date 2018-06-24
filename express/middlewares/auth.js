'use strict';
const User = require('../models').User;

/**
 * @module AuthMiddleware
 * @description Authenticate user token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */

module.exports = function(req, res, next) {

  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    return User
      .findOne({
        where: {
          token: token
        }
      })
      .then(user => {

        if (user) {

          req.user = {
            id: user.id,
            coins: user.coins
          };

          next();

        } else {

          res.status(401).send({
            status: false,
            message: 'Failed to authenticate token.'
          });

        }


      });

  } else {

    res.status(403).send({
      status: false,
      message: 'No token provided.'
    });

  }
};
