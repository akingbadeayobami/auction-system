(function() {
  'use strict';
    /**
     * @class realTimeAuction.auction.AuctionCtrl
     */
    function AuctionCtrl($scope, $interval, $timeout, socket, actionFactory, dataFactory, auctionHttpFactory) {

        /**
         * User Inventories
         * @type {Array}
         */
        $scope.inventories = [];

        /**
         * Auction Model
         * @type {{fullState: string, winner: {}, user: {}, inventory: {}}}
         */
        $scope.auction = {
            fullState: 'ENDED',
            winner: {},
            user: {},
            inventory: {}
        };

        /**
         * User Details
         * @type {{}}
         */
        $scope.user = {};

        /**
         * Auction countdown time
         * @type {number}
         */
        $scope.auctionCountDown = 0;

        socket.on('close_auction', function(auctionInterval) {

            $scope.auction.fullState = auctionInterval.fullState;

            if ($scope.auction.bid > 0) {

                var inventoryIndex = $scope.inventories.findIndex(function(inventory) {
                    return inventory.name == $scope.auction.inventory.name;
                });

                if ($scope.auction.user_id === $scope.user.user_id) {

                    $scope.user.coins += Number($scope.auction.bid);

                    $scope.inventories[inventoryIndex].quantity -= Number($scope.auction.quantity);

                }

                if ($scope.auction.bid_by === $scope.user.user_id) {

                    $scope.user.coins -= Number($scope.auction.bid);

                    $scope.inventories[inventoryIndex].quantity += Number($scope.auction.quantity);


                }

                $scope.auction.winner = {
                    username: auctionInterval.username
                };

            }

        });

        socket.on('bid_placed', function(bidPlaced) {

            $scope.auction.bid = bidPlaced.amount;
            $scope.auction.bid_by = bidPlaced.bid_by;

            dataFactory.setCurrentAuction($scope.auction);

        });

        socket.on('new_end_time', function(newEndTime) {

            currentAuctionTimer(newEndTime.end_time);

        });

        socket.on('new_auction', function(newAuction) {

            $scope.auction = newAuction;

            dataFactory.setCurrentAuction(newAuction);

            currentAuctionTimer(newAuction.end_time);

        });

        socket.on('no_next_auction', function() {
            $scope.auction = {
                fullState: 'ENDED'
            };

            dataFactory.setCurrentAuction($scope.auction);

        });

        var userDataObject = dataFactory.getUserDataObject();

        if (!userDataObject) {

            actionFactory.logOut();

            return false;

        }

        auctionHttpFactory.checkToken(userDataObject.token).then(function(response) {

            if (!response.status) {

                actionFactory.logOut();

                return false;

            }

            $scope.user = {
                'user_id': userDataObject.user_id,
                'username': userDataObject.username,
                'token': userDataObject.token,
                'coins': response.coins
            };

            dataFactory.setUserDataObject($scope.user);

            auctionHttpFactory.getInventories().then(function(inventories) {

                $scope.inventories = inventories;

            });

            auctionHttpFactory.getCurrentAuction().then(function(currentAuction) {

                if (!currentAuction.noAuction) {

                    $scope.auction = currentAuction;

                    dataFactory.setCurrentAuction(currentAuction);

                    if (currentAuction.fullState === "LIVE") {

                        currentAuctionTimer(currentAuction.end_time);

                    } else if (currentAuction.fullState === "AUCTION_INTERVAL") {

                        auctionIntervalTimeout(currentAuction.end_time);

                    }

                }

            });

        });

        var stopCountDown;

        var timeOut;

        /**
         * @function getNextAuction
         * @description checks for next auction
         */

        var getNextAuction = function() {

            auctionHttpFactory.checkQueue();

        };

        /**
         * @function getCurrentTime
         * @description Get the current timestamp
         * @returns {number}
         */
        var getCurrentTime = function() {

            var dateInstance = new Date();

            return Math.floor(dateInstance.getTime() / 1000);

        };

        /**
         * @function currentAuctionTimer
         * @description Set the auction countdown
         * @param {number} endTime - The timestamp of when the auction will end
         * @returns undefined
         */
        var currentAuctionTimer = function(endTime) {

            if (angular.isDefined(stopCountDown)) {

                $interval.cancel(stopCountDown);

                stopCountDown = undefined;

            }

            var currentTime = getCurrentTime();

            $scope.auctionCountDown = endTime - currentTime;

            stopCountDown = $interval(function() {

                $scope.auctionCountDown--;

                if ($scope.auctionCountDown <= 0) {

                    $interval.cancel(stopCountDown);

                    timeOut = $timeout(function() {

                        getNextAuction();

                    }, 10 * 1000);

                    var auction = dataFactory.getCurrentAuction();
                    if(auction.bid_by == $scope.user.user_id || !auction.bid_by){

                        auctionHttpFactory.endAuction({
                            auction_id: auction.id,
                            bid_by: auction.bid_by
                        }).then(function(response) {});

                    }


                }

            }, 1000);

        };


        /**
         * @function auctionIntervalTimeout
         * @description Set the 10 secs timeout to display next auction
         * @param {number} endTime - The timestamp of when the auction will end
         * @returns undefined
         */
        var auctionIntervalTimeout = function(endTime) {

            var currentTime = getCurrentTime();

            var auctionIntervalCountDown = endTime - currentTime;

            if (auctionIntervalCountDown > 0) {

                $timeout(function() {

                    getNextAuction();

                }, auctionIntervalCountDown * 1000);

            } else {

                getNextAuction();

            }


        };


        $scope.$on('$destroy', function() {

            if (angular.isDefined(stopCountDown)) {
                $interval.cancel(stopCountDown);
            }

            if (angular.isDefined(timeOut)) {
                $interval.cancel(timeOut);
            }

        });

    }


    /**
   * Auction Module
   * @class realTimeAuction.auction
   */
  angular.module('realTimeAuction.auction')
    .controller('AuctionCtrl', ['$scope', '$interval', '$timeout', 'socket', 'actionFactory', 'dataFactory', 'auctionHttpFactory', AuctionCtrl]);


})();
