'use strict';

describe('realTimeAuction module', function() {
  beforeEach(module('realTimeAuction'));

  beforeEach(module("my.templates"));

  describe('current auction directive', function() {
    it('should show current auction', function() {

      inject(function($compile, $rootScope) {

        $rootScope.auction = {
          fullState: 'ENDED',
          winner: {},
          user: {},
          inventory: {}
        };

        $rootScope.auctionCountDown = 0;

        var element = $compile('<current-auction auction="auction" auction-count-down="auctionCountDown"/>')($rootScope);

        $rootScope.$digest();

        expect(element.text()).to.contain('Current Auction');
      });

    });
  });
});
