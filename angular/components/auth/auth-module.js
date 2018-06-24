(function() {
  'use strict';
    /**
    * Auth Module
    * @class realTimeAuction.auth
    */
  angular.module('realTimeAuction.auth', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/auth', {
        templateUrl: 'components/auth/auth.html',
        controller: 'AuthCtrl'
      });
    }])

})();
