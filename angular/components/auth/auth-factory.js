(function() {
    'use strict';

    /**
     * @class realTimeAuction.auction.authFactory
     * @description Factory to handles the authentication http calls
     */
    function authFactory ($q, $http) {

        return {
            /**
             * @name authenticate
             * @description Authenticate user
             * @param {string} username - Username submitted
             * @returns {Promise<Object>} A promise of an object containing the status of the authentication
             */
            authenticate: function(username) {

                var deferred = $q.defer();

                $http.post('users/authenticate', {
                    username: username
                }).success(function(resp) {

                    deferred.resolve(resp);

                });

                return deferred.promise;

            }

        };

    }

    /**
     * @class realTimeAuction.auth
     */
    angular.module('realTimeAuction.auth')

        .factory('authFactory', ['$q', '$http', authFactory]);

})();
