(function() {
    'use strict';

    /**
     * @class realTimeAuction.auction.currentAuction.currentAuction
     * @description Manages and displays the current auction
     * @example <current-auction auction="{{ auction }}" auction-count-down="{{ auctionCountDown }}" ></current-auction>
     */
    function currentAuction(auctionHttpFactory, auctionConstants, dataFactory) {
        return {
            restrict: 'AE',
            replace: true,
            templateUrl: 'components/auction/current_auction/current-auction.html',
            scope: {
                auction: '=',
                auctionCountDown: '='
            },
            link: function(scope) {

                /**
                 * Default bid model
                 * @type {object}
                 */
                scope.myBid = {
                    amount: 0
                };

                scope.$watch('auctionCountDown', function(newValue) {

                    if (newValue) {
                        scope.auctionCountDown = newValue;
                    }
                });

                scope.user = dataFactory.getUserDataObject();

                /**
                 * @function placeBid
                 * @description Place a bid on current auction
                 * @return {boolean}
                 */
                scope.placeBid = function() {

                    scope.user = dataFactory.getUserDataObject();

                    if (scope.myBid.amount > scope.user.coins) {

                        Materialize.toast("Sorry! you do not have enough coins to place this bid", auctionConstants.toastDuration);

                        return false;

                    }


                    if (scope.myBid.amount < scope.auction.minimum_bid) {

                        Materialize.toast("Your bid must be higher or equal to the minimum bid ", auctionConstants.toastDuration);

                        return false;

                    }

                    if (scope.auction.bid >= scope.myBid.amount) {

                        Materialize.toast("Your bid must be higher than the current winning bid ", auctionConstants.toastDuration);

                        return false;

                    }


                    auctionHttpFactory.placeBid({
                        amount: scope.myBid.amount,
                        user_id: scope.user.user_id,
                        auction_id: scope.auction.id
                    });

                    return true;

                };

            }
        };
    }

    /**
     * @class realTimeAuction.auction.currentAuction
     */
    angular.module('realTimeAuction.auction.currentAuctionDirective', [])

    .directive('currentAuction', ['auctionHttpFactory', 'auctionConstants', 'dataFactory', currentAuction]);

})();