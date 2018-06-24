'use strict';

describe('realTimeAuction module', function() {
  beforeEach(module('realTimeAuction'));

  beforeEach(module("my.templates"));

  describe('inventory directive', function() {
    it('should show Inventories', function() {

      inject(function($compile, $rootScope) {

        $rootScope.inventories = [{
          name: 'Bread',
          image: 'Bread',
          quantity: 30,
        }];

        var element = $compile('<inventory inventories="inventories"/>')($rootScope);

        $rootScope.$digest();

        expect(element.text()).to.contain('Inventories');

      });

    });
  });
});
