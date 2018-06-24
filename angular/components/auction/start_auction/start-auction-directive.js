(function() {
  'use strict';

  /**
  * @class realTimeAuction.auction.startAuctionDirective.startAuction
  * @description Starts Auction
  * @example <start-auction user="{{ user }}"></start-auction>
  */
  function startAuction(auctionHttpFactory, dataFactory, auctionConstants) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'components/auction/start_auction/start-auction.html',
      scope: {
        user: '='
      },
      link: function(scope, element, attrs, controllers) {

        /**
        * Default start auction model
        * @type {object}
        */
        scope.startAuctionModel = {
          quantity: 0,
          minimum_bid: 0,
          inventory_id: 0
        };

        /**
        * @name startAuction
        * @description Start new auction
        * @return {undefined}
        */
        scope.startAuction = function() {

          var inventoryToAuction = dataFactory.getInventoryToAuction();

          var userObject = dataFactory.getUserDataObject();

          // Making sure user has enough quantity inventory
          if (scope.startAuctionModel.quantity > inventoryToAuction.quantity) {

            Materialize.toast("Sorry you do not have enough quantity to auction", auctionConstants.toastDuration);

            return false;

          }

          var params = {
            minimum_bid: scope.startAuctionModel.minimum_bid,
            quantity: scope.startAuctionModel.quantity,
            inventory_id: inventoryToAuction.id,
            user_id: userObject.user_id
          };

          auctionHttpFactory.startAuction(params).then(function(auction) {

            if (auction.fullState === 'QUEUED') {

              Materialize.toast("Your auction has been queued to start after completion of current auction", auctionConstants.toastDuration);


            } else if (auction.fullState === 'LIVE') {

              Materialize.toast("Your auction has started", auctionConstants.toastDuration);

            }

            // Resetting the start auction model
            scope.startAuctionModel = {
              quantity: 0,
              minimum_bid: 0,
              inventory_id: 0
            };


          });


        };

      }
    };
  }

  /**
  * @class realTimeAuction.auction.startAuctionDirective
  */
  angular.module('realTimeAuction.auction.startAuctionDirective', [])

    .directive('startAuction', ['auctionHttpFactory', 'dataFactory', 'auctionConstants', startAuction]);

})();
