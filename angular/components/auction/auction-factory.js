(function() {
    'use strict';

    /**
     * @class realTimeAuction.auction.actionFactory
     * @description Factory that holds the shared actions
     */
    function actionFactory ($location, auctionHttpFactory, dataFactory) {

        return {
            /**
             * @name logOut
             * @description Logs out the user and redirects to the auth route
             */
            logOut: function() {

                var userDataObject = dataFactory.getUserDataObject();

                if (userDataObject) {

                    auctionHttpFactory.clearToken(userDataObject.token);

                }

                dataFactory.clearUserDataObject();

                $location.path('/auth');

            }
        };

    }

    /**
     * @class realTimeAuction.auction.dataFactory
     * @description Factory that holds all the shared data
     */
    function dataFactory() {

        var inventoryToAuction = {};

        var currentAuction = {};

        var userDataObject = JSON.parse(localStorage.getItem('user_data'));

        return {
            setInventoryToAuction: function(inventory) {
                inventoryToAuction = inventory;
            },
            getInventoryToAuction: function() {
                return inventoryToAuction;
            },
            getUserDataObject: function() {
                return userDataObject;
            },
            setUserDataObject: function(userData) {
                userDataObject = userData;
                localStorage.setItem('user_data', JSON.stringify(userData));
            },
            clearUserDataObject: function() {
                userDataObject = null;
                localStorage.removeItem('user_data');
            },
            setCurrentAuction: function(auction) {
                currentAuction = auction;
            },
            getCurrentAuction: function() {
                return currentAuction;
            }
        };


    }

    /**
     * @class realTimeAuction.auction.auctionHttpFactory
     * @description Factory that holds all the http calls for the auction
     */
    function auctionHttpFactory($q, $http) {

        return {

            /**
             * @name clearToken
             * @description Clear the token in the database
             * @param {string} token - User's token
             * @returns {Promise<Object>} A promise of the action status object when fulfilled.
             */
            clearToken: function(token) {

                var deferred = $q.defer();

                $http.delete('users/token/' + token).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name checkToken
             * @description Check the validity of the user token
             * @param {string} token - User's token
             * @returns {Promise<Object>} A promise of the token validity status object when fulfilled
             */
            checkToken: function(token) {

                var deferred = $q.defer();

                $http.post('users/check', {
                    token: token
                }).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name getInventories
             * @description Gets the authenticated user's inventories
             * @returns {Promise<Object[]>} A promise of an array of the user's inventories when fulfilled
             */
            getInventories: function() {

                var deferred = $q.defer();

                $http.get('inventories').success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name getCurrentAuction
             * @description Get the ongoing auction
             * @returns {Promise<Object>} A promise of an object containing the status of the current auction when fulfilled
             */
            getCurrentAuction: function() {

                var deferred = $q.defer();

                $http.get('auctions').success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name startAuction
             * @description  Start an auction
             * @param {object} auction - Auction to be created
             * @param {number} auction.minimum_bid - Minimum bid
             * @param {number} auction.quantity - Quantity
             * @param {number} auction.inventory_id - Inventory id
             * @param {number} auction.user_id - User id
             * @returns {Promise<Object>} A promise of an object containing the status of the start auction request when fulfilled
             */
            startAuction: function(auction) {

                var deferred = $q.defer();

                $http.post('auctions/start', {
                    minimum_bid: auction.minimum_bid,
                    quantity: auction.quantity,
                    inventory_id: auction.inventory_id,
                    user_id: auction.user_id
                }).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name endAuction
             * @description End an auction
             * @param {object} auction - Auction to end
             * @param {number} auction.auction_id - Current auction id
             * @param {number} auction.bid_by - User id of the user who placed the winner bid
             * @returns {Promise<Object>} A promise of an object containing the status of the end auction request when fulfilled
             */
            endAuction: function(auction) {

                var deferred = $q.defer();

                $http.post('auctions/end', {
                    auction_id: auction.auction_id,
                    bid_by: auction.bid_by
                }).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name placeBid
             * @description Place a bid
             * @param {object} bid - Bid to be placed
             * @param {number} bid.amount - Amount to be placed
             * @param {number} bid.user_id - This users's id
             * @param {number} bid.auction_id - Current auction id
             * @returns {Promise<Object>} A promise of an object containing the status of the place bid request when fulfilled
             */
            placeBid: function(bid) {

                var deferred = $q.defer();

                $http.post('auctions/bid', {
                    amount: bid.amount,
                    user_id: bid.user_id,
                    auction_id: bid.auction_id
                }).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            },

            /**
             * @name checkQueue
             * @description Check for queued auctions
             * @returns {Promise<Object>} A promise of an object containing the status of the queue check request when fulfilled
             */
            checkQueue: function() {

                var deferred = $q.defer();

                $http.post('auctions/check', {}).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            }

        };

    }

    /**
     * @class realTimeAuction.auction.socketFactory
     * @description Factory that connects to the socket
     */
    function socketFactory (socketFactory) {
        return socketFactory({
            prefix: 'auction~',
            ioSocket: io.connect('/')
        });
    }

    /**
     * @class realTimeAuction.auth
     */
    angular.module('realTimeAuction.auction')

        .factory('socket', ['socketFactory', socketFactory])

        .factory('auctionHttpFactory', ['$q', '$http', auctionHttpFactory])

        .factory('dataFactory', [dataFactory])

        .factory('actionFactory', ['$location', 'auctionHttpFactory', 'dataFactory', actionFactory]);

})();
