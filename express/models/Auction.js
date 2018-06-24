'use strict';
const models = require('../models');

const auctionStates = require('../enums').AuctionStates;


module.exports = (sequelize, DataTypes) => {
    const Auction = sequelize.define('Auction', {
        user_id: {
            type: DataTypes.INTEGER,
        },
        inventory_id: {
            type: DataTypes.INTEGER,
        },
        quantity: {
            type: DataTypes.INTEGER,
        },
        minimum_bid: {
            type: DataTypes.INTEGER,
        },
        bid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bid_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        end_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        state: {
            type: DataTypes.INTEGER,
            defaultValue: false,
        },
    }, {
        underscored: true,
        tableName: 'auctions',
        getterMethods: {
            fullState() {
                if (this.state) {
                    return auctionStates.get(this.state).key;
                }
                return '';
            }
        },
        setterMethods: {
            fullState(value) {
                this.setDataValue('fullState', value);
            },
        }
    });

    Auction.associate = (models) => {
        Auction.belongsTo(models.Inventory, {
            foreignKey: 'inventory_id',
            as: 'inventory',
        });
        Auction.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        Auction.belongsTo(models.User, {
            foreignKey: 'bid_by',
            as: 'winner',
        });
    };


    return Auction;
};
