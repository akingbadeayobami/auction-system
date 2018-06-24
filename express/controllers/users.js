"use strict";
const User = require('../models').User,
  inventoriesController = require('./inventories'),
  randomstring = require("randomstring");

/** @namespace usersController */
const usersController = {

  /**
   * @name authenticate
   * @description Authenticate a user
   * @param {object} req - Express Request Object
   * @param {object} req.body.username - Username submitted
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  authenticate(req, res) {

    User
      .findOne({
        where: {
          username: req.body.username
        }
      })
      .then(user => {

        const token = randomstring.generate(24);

        // If user exists we just want to update the token
        if (user) {

          user.update({
            token: token
          });

          res.status(200).send({
            token: token,
            user_id: user.id,
          });

          return true;

        }

        // Else we create new user
        User.create({
          coins: 1000,
          username: req.body.username,
          token: token,
        }).then(user => {

          // Creating the default invenvtories
          [
            {
              name: 'bread',
              quantity: 30
            },
            {
              name: 'carrots',
              quantity: 18
            },
            {
              name: 'diamond',
              quantity: 1
            }
          ].forEach(inventory => {

            inventoriesController.create({
              user_id: user.id,
              name: inventory.name,
              quantity: inventory.quantity,
              image: inventory.name,
            });

          });

          res.status(201).send({
            token: token,
            user_id: user.id,
          });

        });



      });

  },

  /**
   * @name checkToken
   * @description Checks the validity of user's token
   * @param {object} req - Express Request Object
   * @param {object} req.body.token - User token
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  checkToken(req, res) {

    User
      .findOne({
        where: {
          token: req.body.token
        }
      })
      .then(user => {

        if (user) {
          return res.status(200).send({
            status: true,
            coins: user.coins
          });
        }

        res.status(200).send({
          status: false,
        });

      });
  },

  /**
  * @name clearToken
  * @description Clear user's token
  * @param {object} req - Express Request Object
  * @param {object} req.params.token - User token
  * @param {object} res - Express Response Object
  * @return {undefined}
  */
  clearToken(req, res) {
    User
      .update({
        token: null
      }, {
        where: {
          token: req.params.token
        }
      }).then(() => res.status(200).send({
      status: true,
      message: 'User Session Cleared successfully.'
    }));

  }

};

module.exports = usersController;
