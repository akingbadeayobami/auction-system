'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        var models = require('../../models');

        var auctions = require('../json/auctions.json');


        return models.Auction.bulkCreate(auctions, {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('auctions', null, {});
    }
};