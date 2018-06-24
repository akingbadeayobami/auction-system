"use strict";
const Inventory = require('../models').Inventory;
const Promise = require('bluebird');

/** @namespace inventoriesController */
const inventoriesController = {

  /**
  * @name getMine
  * @description Get user's inventoriesCreates new auction
  * @param {object} req - Express Request Object
  * @param {number} req.user.id - The authenticated user id
  * @param {object} res - Express Response Object
  * @return {undefined}
  */
  getMine(req, res) {

     Inventory
      .findAll({
        where: {
          user_id: req.user.id
        }
      })
      .then(inventories => {
         res.status(200).send(inventories);
      });


  },
  /**
   * @name create
   * @description Create an inventory
   * @param {object} inventory - Inventory Object
   * @param {number} inventory.user_id - User id
   * @param {string} inventory.name - inventory name
   * @param {number} inventory.quantity - inventory quantity
   * @param {string} inventory.image - image slug
   * @return {Promise} Promise of the created data
   */
  create(inventory) {

    return new Promise((resolve) => {
      Inventory
        .create({
          user_id: inventory.user_id,
          name: inventory.name,
          quantity: inventory.quantity,
          image: inventory.image,
        })
        .then(created => resolve(created));

    });
  },

};

module.exports = inventoriesController;
