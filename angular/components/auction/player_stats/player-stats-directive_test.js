'use strict';

describe('realTimeAuction module', function() {
  beforeEach(module('realTimeAuction'));

  beforeEach(module("my.templates"));

  describe('player-stats directive', function() {
    it('should show Player Stats', function() {

      inject(function($compile, $rootScope) {

        $rootScope.user = {
          username: 'Ayobami',
          coins: '1000'
        };

        var element = $compile('<player-stats user="user"/>')($rootScope);

        $rootScope.$digest();

        expect(element.text()).to.contain('Player Stats');
      });

    });
  });
});
