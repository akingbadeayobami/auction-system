(function() {
  'use strict';

  /**
  * @class realTimeAuction.auction.playerStatsDirective.playerStats
  * @description Display user's details
  * @example <player-stats user="{{ user }}"></player-stats>
  */
  function playerStats(actionFactory) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'components/auction/player_stats/player-stats.html',
      scope: {
        user: '='
      },
      link: function(scope) {

        scope.$watch('user', function(newValue, oldValue) {

          if (newValue) {
            scope.user = newValue;
          }

        });

        /**
        * @name logOut
        * @description Log user out
        * @return {undefined}
        */
        scope.logOut = function() {

          actionFactory.logOut();

        };

      }
    };
  }

  /**
  * @class realTimeAuction.auction.playerStatsDirective
  */
  angular.module('realTimeAuction.auction.playerStatsDirective', [])

    .directive('playerStats', ['actionFactory', playerStats]);

})();
