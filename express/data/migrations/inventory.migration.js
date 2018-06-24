'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('inventories', {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            image: {
                type: Sequelize.STRING
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
        return queryInterface.dropTable('inventories');
    }
};