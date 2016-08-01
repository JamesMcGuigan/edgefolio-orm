angular.module("edgefolio.models").factory("ApiCollection", function($q, $timeout, $rootScope, $http, ApiBaseClass) {
  var ApiCollection = new JS.Class("ApiCollection", ApiBaseClass, {
    extend: {
      url:          "",
      idParam:      null,
      resultsKlass: null
    },
    $initializeObjectProperties: function() {
      this.callSuper();
      if( this.klass.resultsKlass ) {
        this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "results", this.klass.resultsKlass);
      }
    },
    /**
     * @untested
     * Fetches response.data from the api and returns promise with raw data
     * @param options
     * @returns Promise(response.data || null)
     */
    $fetchData: function(options) {
      var callSuper = this.callSuper;
      var baseUrl   = this.$getUrl();
      var outputData = {};
      return this.callSuper(options).then(function(responseData) {
        responseData.results = _.isArray(responseData.results) ? responseData.results : [];
        outputData = responseData;

        if( responseData.results.length === 0 || responseData.results.length >= outputData.count) {
          return outputData;
        } else {
          // No need to refetch ?page=1
          var numberOfPages = _.ceil(outputData.count/responseData.results.length);
          var fetchAllPromise = _(2).range(numberOfPages+1)
            .map(function(pageNumber) {
              return callSuper(_.extend({}, options, {
                url: baseUrl + '?page=' + pageNumber
              }));
            })
            .thru(function(promises) {
              return $q.all(promises);
            })
            .value();

          return fetchAllPromise.then(function(responseDataArray) {
            _.each(responseDataArray, function(data) {
              outputData.results = outputData.results.concat(data.results);
            });
            return outputData;
          })
        }
      });
    },
    /**
     * @untested
     * @param   {Object} itemData       $http({ method: 'POST', url:  this.$getUrl(), data: itemData } })
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $addToCollection: function(itemData) {
      var self = this;
      this.$invalidateCache(this.$getUrl());

      return $http({
        method: 'POST',
        url:    this.$getUrl(),
        data:   itemData
      }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          return $q.reject(response);
        } else {
          self.klass.resultsKlass.load(response.data.id, { data: response.data }); // Add to model layer cache
          if( !_.contains(self.result_ids, response.data.id) ) {
            self.$data.results.push(response.data.id);
            self.$setData(self.$data);                   // Updates $$hashKey and recalls $initializeObjectProperties()
          }
          return self.klass.resultsKlass.load(response.data.id);
        }
      })
    },
    /**
     * @untested
     * @param   {ApiBaseClass} itemData
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $removeFromCollection: function(itemOrId) {
      var id = itemOrId && itemOrId.id || itemOrId;
      if( _.contains(this.$data.results, id) ) {
        _.pull(this.$data.results, id);          // Remove data_item as inline operation
        this.$setData(this.$data);               // Updates $$hashKey and recalls $initializeObjectProperties()
      }
      else {
        // @untested and unrun
        var data_item = _.find( this.$data.results, { id: id }) || null; // this.$data.results[] could be either id or object
        if( data_item && _.contains(this.$data.results, data_item) ) {
          _.pull(this.$data.results, data_item); // Remove data_item as inline operation
          this.$setData(this.$data);             // Updates $$hashKey and recalls $initializeObjectProperties()
        }
      }
      // $timeout(function() { $rootScope.$apply(); }); // need to trigger $scope.$watch inside directives) // TODO: Remove?
    },

    /**
     * TODO: selectboxFundgroup directive not updating on $deleteFromCollection
     * @untested
     * @param   {ApiBaseClass} itemData
     * @returns {Promise<resultsKlass>} newly created resultsKlass
     */
    $deleteFromCollection: function(itemOrId) {
      var self = this;

      return this.klass.resultsKlass.load(itemOrId, { load: false }).$deleteFromApi().then(function(item) {
        self.$removeFromCollection(item);
      })
    }
  });
  return ApiCollection;
});
