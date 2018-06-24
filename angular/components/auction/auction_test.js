'use strict';

describe('realTimeAuction module', function() {

  var scope;
  var ctrl;

  beforeEach(module('realTimeAuction'));

  beforeEach(inject(function($rootScope, $controller) {

    scope = $rootScope.$new();

    ctrl = $controller('AuctionCtrl', {
      $scope: scope
    });

  }));

  describe('Auction controller', function() {

    it('should be in initial state', function() {

      expect(scope.auctionCountDown).to.equal(0);
      expect(scope.inventories).to.be.of.length(0);

    });

  });
});
