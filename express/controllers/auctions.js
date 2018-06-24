"use strict";
const Auction = require('../models').Auction;
const User = require('../models').User;
const Inventory = require('../models').Inventory;
const auctionStates = require('../enums').AuctionStates;
const sequelize = require('sequelize');
const Op = sequelize.Op;
const Promise = require('bluebird');
const moment = require('moment');

/**
 * Auction Duration
 * @type {Number}
 */
const auctionDuration = 90;
/**
 * The name of the person.
 * @type {Number}
 */
const auctionLateBidRefreshDuration = 10;
/**
 * The name of the person.
 * @type {Number}
 */
const auctionIntervalDuration = 10;

/** @namespace auctionController */
const auctionController = {

  /**
   * @name getCurrent
   * @description Gets the current auction including the user who created it, and the inventory that is auctioned and a winner where it applies
   * @param {object} req - Express Request Object
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  getCurrent(req, res) {

    return Auction
      .find({
        where: {
          state: {
            [Op.or]: [auctionStates.LIVE.value, auctionStates.AUCTION_INTERVAL.value]
          }
        },
        include: [{
          model: User,
          as: 'user',
        },
          {
            model: Inventory,
            as: 'inventory',
          },
          {
            model: User,
            as: 'winner',
          },

        ],
      })
      .then(currentAuction => {

        if (!currentAuction) {

          currentAuction = {
            noAuction: true
          };

        }

        res.status(200).send(currentAuction);

      });


  },

  /**
   * @name startNew
   * @description Creates new auction
   * @param {object} req - Express Request Object
   * @param {number} req.body.user_id - The user id
   * @param {number} req.body.inventory_id - The inventory id
   * @param {number} req.body.quantity - The quantity to auction
   * @param {number} req.body.minimum_bid - The minimimum bid
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  startNew(req, res) {

    return Auction.find({
      order: [
        ['id', 'DESC']
      ]
    }).then(lastAuction => {

      let state;

      let endTime;

      // If none is currently running then start it
      if (!lastAuction || lastAuction.state === auctionStates.ENDED.value) {

        state = auctionStates.LIVE.value;

        const currentTime = moment().unix();

        endTime = currentTime + auctionDuration;

      } else {

        // else it queue it to start later

        state = auctionStates.QUEUED.value;

        endTime = null;

      }
      //TODO make sure has enough inventory
      Auction.create({
        user_id: req.body.user_id,
        inventory_id: req.body.inventory_id,
        quantity: req.body.quantity,
        minimum_bid: req.body.minimum_bid,
        bid: 0,
        bid_by: null,
        state: state,
        end_time: endTime,
      })
        .then(created => {

          let fullState = auctionStates.QUEUED.key;

          // If we are starting the auction then we want to get the auction full details and the broadcast it
          if (state === auctionStates.LIVE.value) {

            fullState = auctionStates.LIVE.key;

            const io = req.app.get('socketio');

            Auction
              .find({
                where: {
                  id: created.id
                },
                include: [{
                  model: User,
                  as: 'user',
                },
                  {
                    model: Inventory,
                    as: 'inventory',
                  }
                ],
              }).then(new_auction => {

              io.emit('new_auction', new_auction);

            });

          }

          res.status(200).send({
            status: true,
            fullState: fullState
          });

        });


    });

  },

  /**
   * @name placeBid
   * @description Place a bid on an ongoing auction.
   * @param {object} req - Express Request Object
   * @param {number} req.body.auction_id - The auction id
   * @param {number} req.body.user_id - The user id
   * @param {number} req.body.amount - The amount of bid
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  placeBid(req, res) {

    Auction.find({
      where: {
        id: req.body.auction_id
      }
    }).then(auction => {

      //  Makes sure I am not the owner of the auction
      if (auction.user_id === req.body.user_id) {

        res.status(200).send({
          status: false,
          message: 'Sorry! you can not place a bid on your auction'
        });

        return false;

      }

      //  Makes sure the auction is ongoing
      if (auction.state === auctionStates.ENDED.value || auction.state === auctionStates.AUCTION_INTERVAL.value) {

        res.status(200).send({
          status: false,
          message: 'Sorry! you can not place a bid on an ended auction'
        });

        return false;

      }

      //  Makes sure my bid is greater than the minimum bid
      if (req.body.amount < auction.minimum_bid) {

        res.status(200).send({
          status: false,
          message: 'Sorry! Your bid must be higher or equal to the minimum bid'
        });

        return false;

      }

      //  Makes sure my bid is greater than the current winning bid
      if (auction.bid >= req.body.amount) {

        res.status(200).send({
          status: false,
          message: 'Sorry! Your bid must be higher than the current winning bid'
        });

        return false;

      }

      //  Makes sure I have enough coins
      if (req.body.amount > req.user.coins) {

        res.status(200).send({
          status: false,
          message: 'Sorry! You do not have enough coins to place this bid'
        });

        return false;

      }

      Auction
        .update({
          bid: req.body.amount,
          bid_by: req.body.user_id,
        }, {
          where: {
            id: req.body.auction_id
          }
        }).then(() => {

        const io = req.app.get('socketio');

        const currentTime = moment().unix();
        //TODO remove this from req in angular
        const secondsToFinish = auction.end_time - currentTime;

        const responseToSend = {
          status: true,
          message: 'Bid placed sucessfully'
        };

        // If the auction will finish in less than 10 seconds then we want to refresh it
        if (secondsToFinish < auctionLateBidRefreshDuration) { //TODO make sure that time is above 0

          const newEndTime = currentTime + auctionLateBidRefreshDuration;

          Auction.update({
            end_time: newEndTime,
          }, {
            where: {
              id: req.body.auction_id
            }
          });

          io.emit('new_end_time', {
            end_time: newEndTime,
          });

          responseToSend.metaMessage = "Auction time extended";

        }

        io.emit('bid_placed', {
          amount: req.body.amount,
          bid_by: req.body.user_id,
        });

        res.status(200).send(responseToSend);

      });

    });

  },

  /**
   * @name endAuction
   * @description End an ongoing auction
   * @param {object} req - Express Request Object
   * @param {number} req.body.auction_id - The auction id
   * @param {number} req.body.bid_by - The winner bid user id
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  endAuction(req, res) {

    Promise.all([
      Auction.find({
        where: {
          id: req.body.auction_id
        }
      }),
      User.find({
        where: {
          id: req.body.bid_by
        }
      })
    ]).spread((auction, user) => {

      // Dont want to end an already ended auction
      if (auction.state === auctionStates.AUCTION_INTERVAL.value || auction.state === auctionStates.ENDED.value) {

        res.status(200).send({
          status: true,
          message: 'Auction Closed Already'
        });

        return false;

      }

      Auction
        .update({
          state: auctionStates.AUCTION_INTERVAL.value,
          end_time: sequelize.literal(`end_time + ${auctionIntervalDuration}`),
        }, {
          where: {
            id: req.body.auction_id,
            state: auctionStates.LIVE.value
          }
        });


      const io = req.app.get('socketio');

      io.emit('close_auction', {
        fullState: auctionStates.AUCTION_INTERVAL.key,
        username: (auction.bid > 0) ? user.username : ""
      });

      // If there was a bid then we want to transfer the coins and inventory accordingly
      if (auction.bid > 0) {
        // Add the winning bid in coins to the creator of the auction
        User.update({
          coins: sequelize.literal(`coins + ${auction.bid}`)
        }, {
          where: {
            id: auction.user_id
          }
        });

        // Remove the winning bid in coins from the winner of the auction
        User.update({
          coins: sequelize.literal(`coins - ${auction.bid}`)
        }, {
          where: {
            id: auction.bid_by
          }
        });

        Inventory.find({
          where: {
            id: auction.inventory_id
          }
        }).then(inventory => {

          // Remve the inventory from the creator of the auction
          Inventory.update({
            quantity: sequelize.literal(`quantity - ${auction.quantity}`)
          }, {
            where: {
              user_id: auction.user_id,
              name: inventory.name
            }
          });

          // Adding the inventory to the winner of the auction
          Inventory.update({
            quantity: sequelize.literal(`quantity + ${auction.quantity}`)
          }, {
            where: {
              user_id: auction.bid_by,
              name: inventory.name
            }
          });

        });
      }


      res.status(200).send({
        status: true,
        message: 'Auction Closed Successfully'
      });

    });



  },

  /**
   * @name checkQueue
   * @description Checks for any auction that is in queue
   * @name checkQueue
   * @param {object} req - Express Request Object
   * @param {object} res - Express Response Object
   * @return {undefined}
   */
  checkQueue(req, res) {

    Auction.find({
      where: {
        state: auctionStates.LIVE.value
      }
    }).then(currentAuction => {

      // We dont want to process the queue if there is any ongoing auction
      if (currentAuction) {

        res.status(200).send({
          status: false,
          message: "You can only check the queue when there is no ongoing auction"
        });

        return false;

      }

      Auction
        .update({
          state: auctionStates.ENDED.value,
        }, {
          where: {
            state: auctionStates.AUCTION_INTERVAL.value
          }
        });

      Auction.find({
        where: {
          state: auctionStates.QUEUED.value
        },
        order: [
          ['id', 'ASC']
        ],
        include: [{
          model: User,
          as: 'user',
        },
          {
            model: Inventory,
            as: 'inventory',
          }
        ],
      }).then(queuedAuction => {

        const io = req.app.get('socketio');

        let new_auction = false;

        // if there is an auction then we want to broadcast it
        if (queuedAuction) {

          const currentTime = moment().unix();

          let endTime = currentTime + auctionDuration;

          Auction.update({
            state: auctionStates.LIVE.value,
            end_time: endTime,
          }, {
            where: {
              id: queuedAuction.id
            }
          });

          queuedAuction.end_time = endTime;
          queuedAuction.state = auctionStates.LIVE.value;
          queuedAuction.fullState = auctionStates.LIVE.key;

          new_auction = true;

          io.emit('new_auction', queuedAuction);

        } else {

          io.emit('no_next_auction', {});

        }

        res.status(200).send({
          status: true,
          new_auction: new_auction
        });

        return true;

      });

    });


  }

};

module.exports = auctionController;
