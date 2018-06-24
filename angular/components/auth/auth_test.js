'use strict';

describe('realTimeAuction module', function() {

  var scope;
  var ctrl;

  beforeEach(module('realTimeAuction'));

  beforeEach(inject(function($rootScope, $controller) {

    scope = $rootScope.$new();

    ctrl = $controller('AuthCtrl', {
      $scope: scope
    });

  }));

  describe('Auth controller', function() {

    it('should be in initial state', function() {

      expect(scope.username).to.equal('');

    });

  });
});
