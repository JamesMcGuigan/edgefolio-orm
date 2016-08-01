'use strict';

/**
 * TODO: Add loading and error states
 */
angular.module('edgefolio.enterprise.widgets.fundgroupMenu', [
  'edgefolio.models'
])
.directive('edgefolioFundgroupMenu', function(
  $q, $stateParams,
  FundGroup
) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/fundgroupMenu/fundgroupMenu.html',
    scope: {
      fundgroupId:    '=',
      selectedFundId: '=?',
      hoverFundId:    '=?',
      timeframeId:    '=?',
      fundSref:       '=?'
    },
    controller: function($scope) {
      $scope.defaults = {
        fundSref: 'root.hedge-funds.profile'
      };
      $scope.state = {
        loading: true,
        error:   false
      };
      $scope.data = {
        fundgroup: null,
        funds: []
      };
      $scope.events = {
        removeId: function(id) {
          if( $scope.data.fundgroup ) {
            $scope.data.fundgroup.$removeFundIds(id);
          }
        }
      }
    },
    link: function($scope, element, attr) {
      $scope.$scope = $scope;
      $scope.reload = function() {
        $scope.state.loading  = true;
        $scope.state.error    = false;

        FundGroup.load($scope.fundgroupId, {silent: true}).$loadPromise.then(function(fundgroup) {
          $scope.data.fundgroup = fundgroup;
          $scope.selectedFundId = _.contains(fundgroup.fund_ids, Number($scope.selectedFundId)) ? $scope.selectedFundId : _.first(fundgroup.fund_ids) || $scope.selectedFundId;
        })
        ['finally'](function() {
          $scope.state.loading = false;
          $scope.state.error   = !_.size(_.get($scope, 'data.fundgroup.funds'));
        })
      };

      $scope.$watchCollection('[fundgroupId, data.fundgroup.$$hashKey]', function() {
        if( !$scope.fundgroupId ) { return; }
        $scope.reload();
      });
    }
  }
});
