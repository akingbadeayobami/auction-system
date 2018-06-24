(function() {
  'use strict';

  /**
  * @class realTimeAuction.auction.inventoryDirective.inventory
  * @description Display user's inventories
  * @example <inventory inventories="{{ inventories }}"></inventory>
  */
  function inventory(dataFactory) {
    return {
      restrict: 'AE',
      replace: true,
      templateUrl: 'components/auction/inventory/inventory.html',
      scope: {
        inventories: '='
      },
      link: function(scope, element, attrs, controllers) {

        scope.$watch('inventories', function(newValue, oldValue) {

          if (newValue) {
            scope.inventories = newValue;
          }

        });

        /**
         * @name setThisInventoryForAuction
         * @description Select this inventory for auction
         * @return {undefined}
         */
        scope.setThisInventoryForAuction = function(inventory) {
          dataFactory.setInventoryToAuction(inventory);
        };

      }
    };
  }

  /**
  * @class realTimeAuction.auction.inventoryDirective
  */
  angular.module('realTimeAuction.auction.inventoryDirective', [])

    .directive('inventory', ['dataFactory', inventory]);

})();
