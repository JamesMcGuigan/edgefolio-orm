'use strict';

/**
 * TODO: Add loading and error states
 */
angular.module('edgefolio.enterprise.widgets.timeseriesTable', [
  'edgefolio.models'
])
.directive('edgefolioTimeseriesTable', function(
  $q, $stateParams,
  ApiBaseClass, DateBucket, Fund, TimeSeries
) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/timeseriesTable/timeseriesTable.html',
    scope: {
      timeseriesId: '=',
      timeframeId:  '=?'
    },
    controller: function($scope) {
      $scope.state = {
        loading: true,
        error:   false,
        selected: {
          month: null,
          year:  null
        }
      };
      $scope.data = {
        months:     [],
        years:      [],
        timeseries: null,
        table:      null
      };
      $scope.events = {
        isNegative: function(value) {
          return value < 0;
        }
      };
    },
    link: function($scope, element, attr) {
      $scope.timeframeId  = $scope.timeframeId || 0;
      $scope.data.months  = moment.monthsShort().concat('YTD');

      $scope.reload = function() {
        $scope.state.loading = true;

        TimeSeries.loadFromUuid($scope.timeseriesId, { timeframe_id: $scope.timeframeId }).then(function(timeseries) {
          $scope.state.loading = false;
          $scope.state.error   = !timeseries || _.all(timeseries, _.isNull);

          $scope.data.timeseries = timeseries;
          if( !timeseries ) {

            $scope.data.table  = {};
            $scope.data.years  = [];
            $scope.state.error = true;

          } else {

            $scope.data.table  = {};
            _.forIn($scope.data.timeseries, function(value, date) {
              date = moment(date);
              _.set($scope.data.table, [date.year(), moment.monthsShort(date.month())], value);
            });

            _.forIn($scope.data.table, function(row, year) {
              $scope.data.table[year]['YTD'] = _(row)
                .values()
                .reject(_.isNull)
                .thru(TimeSeries.toCalc, TimeSeries)
                .map(function(value)  { return value + 1; })
                .thru(ss.product)
                .thru(function(value) { return value - 1; })
                .thru(TimeSeries.fromCalc, TimeSeries)
                .value();
            });

            $scope.data.years  = _.keys($scope.data.table).sort().reverse();
            $scope.data.months = moment.monthsShort().concat('YTD');
          }
        });
      };
      $scope.$watchCollection('[timeframeId, timeseriesId]', function() {
        $scope.reload();
      });
    }
  }
});
