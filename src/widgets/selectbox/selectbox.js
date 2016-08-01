'use strict';

angular.module('edgefolio.enterprise.widgets.selectbox', [
  'edgefolio.models'
])
.controller('EdgefolioSelectboxController', function($scope, $q) {
  $scope.state = {
    loading:      true,
    selectedItem: null
  };
  $scope.events = {
    onChange: function(options) {
      $scope.selectedId = _.get($scope, ['state','selectedItem','id']) || null;
      if( _.isFunction($scope.onChange) ) {
        $scope.onChange({ item: $scope.state.selectedItem })
      }
    }
  };
  $scope.reload = function() {
    $scope.label = String($scope.label || '').replace(/(\S)\s*:?\s*$/, '$1:'); // $scope.label = $scope.label + ':'

    $scope.state.loading = true;
    var promises = _($scope.items).pluck('$loadPromise').filter().value();
    $q.all(promises).then(function() {
      $scope.state.loading = false;
      $scope.updateSelectedItem();
    });
  };

  $scope.updateSelectedItem = function() {
    $scope.state.selectedItem = _.find($scope.items, function(item) {
      return item && item.id == $scope.selectedId; // soft equals  1 == "1"
    });
    $scope.state.selectedItem = $scope.state.selectedItem || _.first($scope.items);
    $scope.selectedId         = _.get($scope, ['state','selectedItem','id']) || null;
  };
  $scope.$watch('selectedId', function() {
    if( arguments[0] != arguments[1] ) {
      $scope.updateSelectedItem();
    }
  });
})
.directive('edgefolioSelectbox', function($q) {
  return {
    restrict: 'E',
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      label:      '@',  // {String} 'Benchmarks:'
      items:      '=?', // {Array<object>} [{ id:, name: }, ...]
      selectedId: '=?', // {Number}
      onChange:   '&?'  // {Function} function(selectedItem)
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.$watchCollection('[label, items, selectedId]', function() {
        $scope.reload();
      });
    }
  };
})
.directive('edgefolioSelectboxFundgroup', function(Edgefolio, FundGroups) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      selectedId: '=?', // {Number}
      onChange:   '&?', // {Function} function(selectedItem)
      onDelete:   '&?'  // {Function} @unimplemented
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.label = "Watchlist";
      $scope.items = [];

      // ApiCollection.$deleteFromCollection() will trigger this watch
      $scope.$watch(function() { return Edgefolio.FundGroups.load().$$hashKey }, function() {
        FundGroups.load().$preloadPromise.then(function(fundgroups) {
          $scope.items = _.get(fundgroups, 'results');
        });
      });
      $scope.$watch('items', function() {
        $scope.updateSelectedItem();
        $scope.reload();
      })
    }
  };
})
.directive('edgefolioSelectboxBenchmark', function(Edgefolio, Benchmarks) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/assets/whitelabel/enterprise/widgets/selectbox/selectbox.html',
    scope: {
      selectedId: '=?', // {Number}
      onChange:   '&?', // {Function} function(selectedItem)
      onDelete:   '&?'  // {Function} @unimplemented
    },
    controller: 'EdgefolioSelectboxController',
    link: function($scope, element, attr) {
      $scope.label = "Benchmark";
      $scope.items = [];

      // ApiCollection.$deleteFromCollection() will trigger this watch
      $scope.$watch(function() { return Edgefolio.Benchmarks.load().$$hashKey }, function() {
        Benchmarks.load().$preloadPromise.then(function(benchmarks) {
          $scope.items = _.get(benchmarks, 'results');
        });
      });
      $scope.$watch('items', function() {
        $scope.updateSelectedItem();
        $scope.reload();
      })
    }
  };
});
