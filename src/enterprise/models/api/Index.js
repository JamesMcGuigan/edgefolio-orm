// https://v3.edgefolio.com/api/indexes/
angular.module('edgefolio.models').factory('Index', function(ApiBaseClass) {
  var Index = new JS.Class('Index', ApiBaseClass, {
    extend: {
      url:       "/api/indexes/:index_id/",
      idParam:   "index_id"
    },
    $initializeObjectProperties: function() {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "returns_time_series", "TimeSeries");
    },
    $statistics: function(options) {
      return this.returns_time_series.$statistics(options);
    }
  });
  return Index;
});
