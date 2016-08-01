// https://v3.edgefolio.com/api/funds/
angular.module('edgefolio.models').factory('Fund', function(
  $q, ApiBaseClass, CountryCodes, LegalStructures, TimeSeries, Index, CurrencySymbolMap
) {
  var Fund = new JS.Class('Fund', ApiBaseClass, {
    extend: {
      url:       "/api/funds/:fund_id/",
      idParam:   "fund_id",
      risk_free_index_id: 63304 // HARD-CODED: { id: 63304, "name": "BofAML US Treasury Bills 1 Yr TR USD"," }
    },
    $reload: function() {
      this.callSuper();

      //this.klass.ApiFieldGenerator.defineGetters(this, {
      //  // Wait for $preloadPromise to be accessed before lazy-loading child data
      //});

      // Ensure risk_free_index is always loaded
      return this.$loadPromise.then(function(fund) {
        $q.all(
          _.pluck(fund.share_classes, '$loadPromise') // Force preload of all share class data
        )
        .then(function() {
          // Sort share classes by length of returns_time_series (longest first)
          fund.share_classes    = _.sortBy(fund.share_classes, function(share_class) { return -_.size(share_class.returns_time_series); });
          fund.base_share_class = _.first(fund.share_classes);
        })
        .then(function() {
          // BUGFIX: risk_free_index not always defined in unit tests
          if( fund.risk_free_index ) {
            return fund.risk_free_index.$loadPromise;
          }
        })
        .then(function() {
          return fund;
        })
      });
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          var self = this;
          return $q.when(self.$loadPromise)
          .then(function() {
            var promises = _([
              self.management_company,
              self.share_classes,
              self.service_providers,
              self.managers,
              self.category_benchmark_index,
              self.asset_class_benchmark_index,
              self.prospectus_benchmark_index,
              self.risk_free_index
            ])
            .flatten()
            .pluck('$loadPromise') // .pluck($loadPromise) only goes one level deep, .pluck('$preloadPromise') for fully recursive
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

    $setData: function(data) {
      // BUGFIX: _.extend() causing callSuper()::_.isObject() null data check to fail
      if( _.isObject(data) ) {
        data = _.extend({
          risk_free_index: this.klass.risk_free_index_id // HARD-CODED: { id: 63304, "name": "BofAML US Treasury Bills 1 Yr TR USD"," }
        }, data);
      }
      return this.callSuper(data);
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company",      "ManagementCompany");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "share_classes",      "ShareClass");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "service_providers",  "ServiceProvider");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "managers",           "Manager");
      this.klass.ApiFieldGenerator.lookupOverwrite(this, "legal_structure",    LegalStructures);

      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "aum_time_series",      "TimeSeries");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "category_benchmark_index",    "Index");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "asset_class_benchmark_index", "Index");
      this.klass.ApiFieldGenerator.lazyLoadId(this,  "prospectus_benchmark_index",  "Index");

      this.klass.ApiFieldGenerator.lazyLoadId(this,  "risk_free_index",   "Index");
      //this.klass.ApiFieldGenerator.selfCaching(this, 'base_share_class', this.$base_share_class);

      // V2 API Mappings
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.amount',   'aum_time_series.latest',      'aum_time_series');
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.currency', 'aum_series_currency');
      this.klass.ApiFieldGenerator.alias(this,       'latest_aum.date',     'aum_time_series.latest_date', 'aum_time_series');
      this.klass.ApiFieldGenerator.lookupAlias(this, "latest_aum.symbol",   "aum_series_currency",         CurrencySymbolMap);

      this.klass.ApiFieldGenerator.lookupOverwrite(this, "domicile_country",      CountryCodes);
      this.klass.ApiFieldGenerator.lookupAlias(this,     "domicile_country_code", "domicile_country");


      this.klass.ApiFieldGenerator.objectAlias(this, "investors_breakdown", [
        "sovereign_wealth",
        "pension_funds",
        "foundations_and_endowments",
        "consultants",
        "family_offices",
        "funds_of_funds",
        "managed_account_platforms",
        "seeders_and_accelerators",
        "high_net_worth_individuals",
        "internal",
        "number_of_investors"
      ]);
    },

    $isValidForTimeframeId: function(timeframe_id) {
      if( this.base_share_class ) {
        return this.base_share_class.$isValidForTimeframeId(timeframe_id);
      } else {
        return false;
      }
    },

    /**
     * @param   {Object} options
     * @returns {Object}
     */
    $statistics: function(options) {
      options = _.extend({
        share_class_id:  _.get(this, 'base_share_class.id') || null,
        risk_free_index: this.risk_free_index || null
      }, options);
      return TimeSeries.statistics(options);
    }
  });
  return Fund;
});
