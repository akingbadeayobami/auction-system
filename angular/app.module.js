(function() {
  'use strict';

  /**
   * @class realTimeAuction
   */
  angular.module('realTimeAuction', [
    'ngRoute',
    'realTimeAuction.auth',
    'realTimeAuction.auction'
  ])
    .constant("serverUrl", {
      path: "/api/"
    })
    .factory('authHttpResponseInterceptor', ['$q', 'serverUrl', function($q, serverUrl) {


      return {

        request: function(config) {

          if (config.url.indexOf('.html') == -1) {

            config.url = serverUrl.path + config.url;

            var userDataString = localStorage.getItem('user_data');

            if (userDataString) {

              var userDataObject = JSON.parse(userDataString);

              config.headers['x-access-token'] = userDataObject.token;

            }

          }

          return config;

        },

        response: function(response) {

          return response || $q.when(response);

        },

        responseError: function(reason) {

          return $q.reject(reason);

        }

      };

    }])

    .config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {

      $locationProvider.hashPrefix('!');

      $routeProvider.otherwise({
        redirectTo: '/auth'
      });

      $httpProvider.interceptors.push('authHttpResponseInterceptor');

    }]);
})();
