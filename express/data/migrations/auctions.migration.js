'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('auctions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,

            },
            inventory_id: {
                type: Sequelize.INTEGER,
                allowNull: false,

            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,

            },
            minimum_bid: {
                type: Sequelize.INTEGER,
                allowNull: false,

            },
            bid: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            bid_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            state: {
                type: Sequelize.INTEGER, // TODO limit 1,
                allowNull: false,

            },
            end_time: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('auctions');
    }
};