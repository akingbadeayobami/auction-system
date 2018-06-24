(function() {
  'use strict';
  /**
   * Auction Module
   * @class realTimeAuction.auction
   */
  angular.module('realTimeAuction.auction', [
      'ngRoute',
      'btford.socket-io',
      'ui.materialize.modal',
      'realTimeAuction.auction.playerStatsDirective',
      'realTimeAuction.auction.inventoryDirective',
      'realTimeAuction.auction.currentAuctionDirective',
      'realTimeAuction.auction.startAuctionDirective'
  ])
    .constant("auctionConstants", {
      toastDuration: 3000
    })
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/auction', {
        templateUrl: 'components/auction/auction.html',
        controller: 'AuctionCtrl'
      });
    }])

})();
