// Collections

angular.module("edgefolio.models").factory("Indexes", function(ApiCollection, Index) {
  var Indexes = new JS.Class("Indexes", ApiCollection, {
    extend: {
      url:          "/api/indexes/",
      idParam:      null,
      resultsKlass: Index
    }
  });
  return Indexes;
});

/**
 * Benchmarks are currently implemented as the full set of available indexes
 */
angular.module("edgefolio.models").factory("Benchmarks", function(ApiCollection, Indexes, Index) {
  var Benchmarks = new JS.Class("Benchmarks", Indexes, {
    extend: {
      url:          "/api/indexes/",
      idParam:      null,
      resultsKlass: Index
    }
  });
  return Benchmarks;
});
