(function() {
  'use strict';

    /**
     * @class realTimeAuction.auth.AuthCtrl
     */
    function AuthCtrl($scope, $location, authFactory, dataFactory) {
        /**
         * username model
         * @type {string}
         */
        $scope.username = '';

        var userDataString = dataFactory.getUserDataObject();

        if (userDataString) {

            $location.path('/auction');

            return false;

        }

        /**
         * @function $scope.authenticate
         * @description Authenticate user
         */
        $scope.authenticate = function() {

            authFactory.authenticate($scope.username).then(function(response) {

                var userData = {
                    token: response.token,
                    username: $scope.username,
                    user_id: response.user_id
                };

                dataFactory.setUserDataObject(userData);

                $location.path('/auction');

            });
        };

    }

    /**
     * Auth Module
     * @class realTimeAuction.auth
     */
    angular.module('realTimeAuction.auth')

    .controller('AuthCtrl', ['$scope', '$location', 'authFactory', 'dataFactory', AuthCtrl]);


})();
