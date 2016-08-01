'use strict';

angular.module('edgefolio.enterprise.widgets.timeframeSelector', [
  'edgefolio.models',
  'edgefolio.constants.TimeframeDefinitions'
])
.directive('edgefolioTimeframeSelector', function($q, TimeframeDefinitions, ApiBaseClass, TimeSeries, FundGroup) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/timeframeSelector/timeframeSelector.html',
    scope: {
      fundgroupId: '=?',        // {Number}
      items:       '=?',        // {Array.<UUID>} TODO: rename uuids
      selectedId:  '=?',        // {Number}
      hideSinceInception: '=?'  // {Boolean}
    },
    controller: function($scope) {
      $scope.events = {
        onChange: function(options) {
          $scope.state.selectedTimeframe = _.get(options,'timeframe');
          $scope.selectedId              = _.get(options,'timeframe.id') || 0;
        },
        isValid: function(timeframe) {
          if( timeframe.id === 0                     ) { return true;  }
          if( _.size($scope.items) === 0             ) { return true;  }
          if( !_.isFinite($scope.state.maxMonths)    ) { return true;  }
          if( timeframe.id <= $scope.state.maxMonths ) { return true;  }
          else                                         { return false; }
        }
      };
    },
    link: function($scope, element, attr) {
      $scope.state = {};
      $scope.state.timeframes = _(_(TimeframeDefinitions).cloneDeep()).reject($scope.hideSinceInception ? { id: 0 } : false).value();
      $scope.state.maxMonths  = 0;

      $scope.data = {
        fundgroup: null
      };

      $scope.reload = function() {
        var promises = _([$scope.items])
          .flatten(false)
          .map(ApiBaseClass.loadUuid)
          .map(function(instance) {
            return [instance, _.get(instance, 'base_share_class')];
          })
          .flatten(true)
          .pluck('$loadPromise')
          .filter()
          .value();

        if( promises.length === 0 ) { return; }

        $q.all(promises).then(function recurse(items) {
          var time_series_array = _.filter(_.flatten([
            _.pluck(items, 'returns_time_series'),
            _.pluck(items, ['base_share_class','returns_time_series']),
            _(items).pluck('funds').flatten().pluck(['base_share_class','returns_time_series']).value() // FundGroup
          ]));

          // Need to rerun this after promises have loaded for it to take precedence over other $stateParams.timeframe setters
          $scope.selectedId = _.contains($scope.state.timeframes, { id: Number($scope.selectedId) }) && $scope.selectedId
                              || _($scope.state.timeframes).pluck('id').first()
                              || 0
          ;
          var first_date  = _(time_series_array).pluck('first_date').sortBy().first();
          $scope.state.maxMonths = moment().diff(first_date,  'months');

          // TimeframeDefinitions.id is months ago
          _.forEach($scope.state.timeframes, function(timeframe) {
            timeframe.invalid = !$scope.events.isValid(timeframe);
          });
          if( _.get($scope, 'state.selectedTimeframe.invalid') ) {
            $scope.state.selectedTimeframe = _.find($scope.state.timeframes, { invalid: false }) || $scope.state.selectedTimeframe;
          }
        });
      };


      $scope.$watch('selectedId', function(newVal, oldVal) {
        if( Number(newVal) != Number(oldVal) ) {
          $scope.state.selectedTimeframe = _.find($scope.state.timeframes, { id: Number($scope.selectedId) || 0 });
          $scope.selectedId              = Number(_.get($scope.state.selectedTimeframe,'id')) || 0;
        }
      });
      $scope.$watchCollection('[fundgroupId, data.fundgroup.$$hashKey]', function() {
        if( !$scope.fundgroupId ) { return; }
        FundGroup.load($scope.fundgroupId).$preloadPromise.then(function(fundgroup) {
          $scope.data.fundgroup = fundgroup;
          $scope.items = fundgroup.funds || [];
        })
      });
      $scope.$watch('items', function() {
        $scope.reload();
      })
    }
  }
});
