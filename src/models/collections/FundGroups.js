angular.module("edgefolio.models").factory("FundGroups", function($q, $http, ApiCollection, FundGroup) {
  var FundGroups = new JS.Class("FundGroups", ApiCollection, {
    extend: {
      url:          "/api/user/fund-groups/",
      idParam:      null,
      resultsKlass: FundGroup
    }

    ///**
    // * Fake Data for testing FundGroups
    // * @param options
    // * @returns {Promise} { count:, next:, prev:, results: [{ id:, created:, modifed:, name, funds: [ Number, ... ] }, ... ]}
    // */
    //,$fetchData: function(options) {
    //  // NOTE: Fake FundGroup Data for testing
    //  var responseData = [
    //    {
    //      id: 458,
    //      created: "2015-08-04T13:55:15.054963Z",
    //      modified: "2015-08-04T13:55:15.059178Z",
    //      name: "Demo FundGroup",
    //      funds: [4, 5, 6, 7]
    //    },
    //    {
    //      id: 457,
    //      created: "2015-08-04T13:55:15.026575Z",
    //      modified: "2015-08-04T13:55:15.030677Z",
    //      name: "Single Fund FundGroup",
    //      funds: [1]
    //    },
    //    {
    //      id: 456,
    //      created: "2015-08-04T13:55:14.996139Z",
    //      modified: "2015-08-04T13:55:15.000797Z",
    //      name: "Empty FundGroup",
    //      funds: []
    //    },
    //    {
    //      id: 455,
    //      created: "2015-08-04T13:55:14.996139Z",
    //      modified: "2015-08-04T13:55:15.000797Z",
    //      name: "Giant FundGroup",
    //      funds: _.range(1, 100)
    //    }
    //  ];
    //  return $q.when({ results: responseData });
    //}
  });
  return FundGroups;
});

angular.module("edgefolio.models").factory("FundGroup", function($q, $http, ApiBaseClass) {
  var FundGroup = new JS.Class("FundGroup", ApiBaseClass, {
    extend: {
      url:          "/api/user/fund-groups/:fundgroup_id/",
      idParam:      "fundgroup_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          var self = this;
          return $q.when(self.$loadPromise)
          .then(function() {
            var promises = _([
              self.funds
            ])
            .flatten()
            .pluck('$loadPromise')
            .reject(_.isNull)
            .map(function(promise) {
              return $q.when(promise)['catch'](_.noop);
            })
            .value();

            return $q.all(promises).then(function() {
              return self;
            });
          });
        }
      })
    },
    $patchFundIds: function(fund_ids) {
      var self = this;
      this.$invalidateCache(this.$getUrl());

      return $http({
        method: 'PATCH',
        url:    this.$getUrl(),
        data:   {
          funds: _([fund_ids]).flatten(true).filter().map(String).unique().value()
        }
      }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          return $q.reject(response);
        } else {
          self.$setData(response.data);
        }
      }).then(function() {
        return self;
      })
    },
    $addFundIds: function(id) {
      return this.$patchFundIds(_.flatten([this.fund_ids, Number(id)]));
    },
    $removeFundIds: function(id) {
      return this.$patchFundIds(_.without(this.fund_ids, Number(id)));
    }
  });
  return FundGroup;
});
