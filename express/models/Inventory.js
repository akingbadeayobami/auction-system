'use strict';
module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },
        quantity: {
            type: DataTypes.INTEGER,
        },
        image: {
            type: DataTypes.STRING,
        },
    }, {
        underscored: true,
        tableName: 'inventories',
    });

    return Inventory;
};
