'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        var models = require('../../models');

        var users = require('../json/users.json');

        return models.User.bulkCreate(users, {});

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', null, {});
    }
};
