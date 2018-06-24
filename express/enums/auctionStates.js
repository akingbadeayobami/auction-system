'use strict';
const Enum = require('enum');

/**
 * Enum for states of auctions
 * @readonly
 * @enum {number}
 * @module enums/auctionStates
 */

module.exports = new Enum({
    'QUEUED': 1,
    'LIVE': 2,
    'AUCTION_INTERVAL': 3,
    'ENDED': 4,
});
