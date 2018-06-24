'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        var models = require('../../models');

        var inventories = require('../json/inventories.json');

        return models.Inventory.bulkCreate(inventories, {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('inventories', null, {});
    }
};