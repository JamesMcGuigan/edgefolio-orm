/**
 *  Convenience namespace for accessing model framework from console, or angular view templates
 */
angular.module('edgefolio.models').factory('Edgefolio', function() { return {} });
angular.module('edgefolio.models').run(function($injector, $rootScope, $window, Edgefolio, ApiFieldGenerator) {
  $window.Edgefolio    = Edgefolio;
  $rootScope.Edgefolio = Edgefolio;

  var classNames = [
    "ApiCache", "ApiFieldGenerator", "CallbackPromise",

    "ApiBaseClass",
    "User",
    "Company", "ManagementCompany", "InvestmentCompany", "ServiceProvider",
    "Fund", "ShareClass",
    "Person", "Manager", "Investor",
    "DateBucket", "TimeSeries",
    //"DateBucketMapped", "DateBucketValue", "TimeSeriesValue",

    "ApiCollection",
    "Indexes", "Benchmarks", "Index",
    "FundGroups", "FundGroup"
  ];
  for( var i in classNames ) {
    $rootScope[classNames[i]] = Edgefolio[classNames[i]] || ApiFieldGenerator._getKlass(classNames[i]);
  }
});
