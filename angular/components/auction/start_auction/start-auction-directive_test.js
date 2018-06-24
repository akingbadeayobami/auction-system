'use strict';

describe('realTimeAuction module', function() {

  beforeEach(module('realTimeAuction'));

  beforeEach(module("my.templates"));

  describe('start-auction directive', function() {
    it('should show Start Auction', function() {

      inject(function($compile, $rootScope) {
        var element = $compile('<start-auction />')($rootScope);
        $rootScope.$digest();
        expect(element.text()).to.contain('Start Auction');
      });

    });
  });
});
