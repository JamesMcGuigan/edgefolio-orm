// https://v3.edgefolio.com/api/funds/
angular.module('edgefolio.models').factory('ShareClass', function(
  $q, ApiBaseClass, Fund, Benchmarks, Index, TimeSeries, TimeframeDefinitions
) {
  var ShareClass = new JS.Class('ShareClass', ApiBaseClass, {
    $initializeObjectProperties: function(data) {
      var self = this;
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "fund", "Fund");
      this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "returns_time_series", TimeSeries);

      this.klass.ApiFieldGenerator.alias(this, "max_timeframe_id",  'returns_time_series.max_timeframe_id','amount');

      this.klass.ApiFieldGenerator.defineGetters(this, "time_periods", function() {
        return _(TimeframeDefinitions)
          .filter(function(timeframe) {
            if( timeframe.id === 0                    ) { return true;  }
            if( this.max_timeframe_id === 0           ) { return false; }
            if( timeframe.id <= this.max_timeframe_id ) { return true;  }
            else                                        { return false  }
          }, this)
          .cloneDeep()
      });


      this.$loadPromise.then(function() {
        return Benchmarks.load().$loadPromise.then(function(benchmark) {
          self.benchmarks = benchmark.results;
        })
      });
    },
    $isValidForTimeframeId: function(timeframe_id) {
      timeframe_id = Number(timeframe_id && timeframe_id.id || timeframe_id) || 0;

      if( timeframe_id === 0                    ) { return true;  }
      if( this.max_timeframe_id === 0           ) { return false; }
      if( timeframe_id <= this.max_timeframe_id ) { return true;  }
      else                                        { return false  }
    },

    $statistics: function(options) {
      options = _.extend({
        share_class:     this,
        risk_free_index: _.get(this, 'fund.risk_free_index') || null
      }, options);
      return TimeSeries.statistics(options);
    },

    /**
     * @untested
     * @param   {Object} options
     * @returns {Promise<Object>}
     */
    loadCombinedReturnsPlotData: function(options) {
      return this.klass.loadCombinedReturnsPlotData(_.extend({
        share_class_id: this.id
      }, options))
    },

    extend: {
      url: "/api/share-classes/:share_class_id/",
      idParam: "share_class_id",

      /**
       * @untested
       * @demo  https://edgefolio-local.com/enterprise/documentation/graphPerformance
       * combined_returns_plot_data = {
       *   "aum_time_series": { "2005-10-31": 1000, ... }
       *   "benchmark": {
       *     "name": "Russell 1000 TR USD",
       *     "performance": [ -1.75, 3.8, 0.14, 2.8, 0.22, 1.42, 1.2, -2.95, 0.13, 0.22, 2.4, 2.37, 3.4, 2.13, 1.28, 1.93, -1.72, 1.04, 4.2, 3.6, -1.91, -3.09, 1.36, 3.82, 1.74, -4.26, -0.65, -6, -3.06, -0.68, 5.07, 1.83, -8.31, -1.16, 1.38, -9.53, -17.46, -7.56, 1.6, -8.16, -10.34, 8.75, 10.12, 5.53, 0.24, 7.63, 3.63, 4.06, -2.21, 5.89, 2.43, -3.6, 3.3, 6.14, 1.85, -7.93, -5.57, 6.95, -4.47, 9.19, 3.89, 0.33, 6.68, 2.4, 3.48, 0.26, 3.01, -1.07, -1.75, -2.17, -5.76, -7.46, 11.21, -0.26, 0.84, 4.87, 4.39, 3.13, -0.58, -6.15, 3.83, 1.19, 2.43, 2.57, -1.69, 0.79, 1.04, 5.42, 1.34, 3.86, 1.81, 2.22, -1.36, 5.35, -2.76, 3.49, 4.4, 2.81, 2.7, -3.19, 4.75, 0.64, 0.47, 2.3, 2.27, -1.62, 4.13, -1.75, 2.44, 2.62, -0.23, -2.75, 5.78, -1.25, 0.71, 1.31, -1.88, 1.93, -6.02, -2.74],
       *     "compounded": [ 982, 1020, 1021, 1050, 1052, 1067, 1080, 1048, 1049, 1052, 1077, 1102, 1140, 1164, 1179, 1202, 1181, 1193, 1244, 1288, 1264, 1225, 1241, 1289, 1311, 1255, 1247, 1172, 1137, 1129, 1186, 1208, 1108, 1095, 1110, 1004, 829, 766, 778, 715, 641, 697, 767, 810, 812, 874, 906, 942, 922, 976, 1000, 964, 995, 1057, 1076, 991, 936, 1001, 956, 1044, 1084, 1088, 1160, 1188, 1230, 1233, 1270, 1256, 1234, 1208, 1138, 1053, 1171, 1168, 1178, 1235, 1290, 1330, 1322, 1241, 1288, 1304, 1335, 1370, 1347, 1357, 1371, 1446, 1465, 1522, 1549, 1584, 1562, 1646, 1600, 1656, 1729, 1777, 1825, 1767, 1851, 1863, 1872, 1915, 1958, 1926, 2006, 1971, 2019, 2072, 2067, 2010, 2126, 2100, 2115, 2143, 2102, 2143, 2014, 1959]
       *   },
       *   "fund": {
       *     "performance": [ -6.94, 3.45, 0.98, 16.64, -8.44, 5.61, 9.23, -4.75, -2.27, -4.4, -5.4, -12.01, 2.88, 2.66, -1.2, 2.58, -0.51, 5.42, 3.84, 2.31, -1.44, 3.7, -3.18, 5.11, 8.16, -1.12, -0.02, -10.94, 4.75, -1.17, 7.17, 2.53, 21.12, -8.81, -6.53, -13.38, -6.76, -13.71, -7.66, -12.25, -3.75, -3.46, 2.77, 3.51, -8.44, 1.44, -0.05, 6.32, -12.51, 6.54, 3.15, -6.28, 7.81, 9.04, 6.84, -8.21, -6.49, 4.07, -3.92, 13.01, 8.6, 1.99, 5.21, 0.92, 5.51, -0.98, 1.16, -5.16, -5.19, 0.37, -3.12, -12.94, 9.22, -1.16, -2.75, 7.42, 3.1, -2.53, -1.12, -9.37, -0.3, -4.15, 3.42, 1.62, -1.24, -1.01, 0.68, 4.74, -1.93, 7.55, -0.77, 3.92, -2.52, 5.12, -1.34, 10.2, 2.39, 3.98, 7.12, -1.82, 6.61, -3.11, -3.06, 2.25, 3.85, -4.27, 2.25, 0.37, 2.51, 1.38, -1.76, -5.39, 3.45, -2.34, -4.12, 2.87, -7.03, 5.83, -7.46, 0],
       *     "compounded":  [ 931, 963, 972, 1134, 1038, 1096, 1198, 1141, 1115, 1066, 1008, 887, 913, 937, 926, 950, 945, 996, 1034, 1058, 1043, 1081, 1047, 1101, 1190, 1177, 1177, 1048, 1098, 1085, 1163, 1192, 1444, 1317, 1231, 1066, 994, 858, 792, 695, 669, 646, 664, 687, 629, 638, 638, 678, 593, 632, 652, 611, 659, 718, 767, 704, 659, 686, 659, 744, 808, 824, 867, 875, 924, 915, 925, 877, 832, 835, 809, 704, 769, 760, 739, 794, 819, 798, 789, 715, 713, 683, 707, 718, 709, 702, 707, 741, 726, 781, 775, 805, 785, 825, 814, 897, 919, 955, 1023, 1005, 1071, 1038, 1006, 1029, 1068, 1023, 1046, 1050, 1076, 1091, 1072, 1014, 1049, 1024, 982, 1010, 939, 994, 920, 920]
       *   },
       *   "timeframe": [ "2005-10-31", "2005-11-30", "2005-12-31", "2006-01-31", "2006-02-28", "2006-03-31", "2006-04-30", "2006-05-31", "2006-06-30", "2006-07-31", "2006-08-31", "2006-09-30", "2006-10-31", "2006-11-30", "2006-12-31", "2007-01-31", "2007-02-28", "2007-03-31", "2007-04-30", "2007-05-31", "2007-06-30", "2007-07-31", "2007-08-31", "2007-09-30", "2007-10-31", "2007-11-30", "2007-12-31", "2008-01-31", "2008-02-29", "2008-03-31", "2008-04-30", "2008-05-31", "2008-06-30", "2008-07-31", "2008-08-31", "2008-09-30", "2008-10-31", "2008-11-30", "2008-12-31", "2009-01-31", "2009-02-28", "2009-03-31", "2009-04-30", "2009-05-31", "2009-06-30", "2009-07-31", "2009-08-31", "2009-09-30", "2009-10-31", "2009-11-30", "2009-12-31", "2010-01-31", "2010-02-28", "2010-03-31", "2010-04-30", "2010-05-31", "2010-06-30", "2010-07-31", "2010-08-31", "2010-09-30", "2010-10-31", "2010-11-30", "2010-12-31", "2011-01-31", "2011-02-28", "2011-03-31", "2011-04-30", "2011-05-31", "2011-06-30", "2011-07-31", "2011-08-31", "2011-09-30", "2011-10-31", "2011-11-30", "2011-12-31", "2012-01-31", "2012-02-29", "2012-03-31", "2012-04-30", "2012-05-31", "2012-06-30", "2012-07-31", "2012-08-31", "2012-09-30", "2012-10-31", "2012-11-30", "2012-12-31", "2013-01-31", "2013-02-28", "2013-03-31", "2013-04-30", "2013-05-31", "2013-06-30", "2013-07-31", "2013-08-31", "2013-09-30", "2013-10-31", "2013-11-30", "2013-12-31", "2014-01-31", "2014-02-28", "2014-03-31", "2014-04-30", "2014-05-31", "2014-06-30", "2014-07-31", "2014-08-31", "2014-09-30", "2014-10-31", "2014-11-30", "2014-12-31", "2015-01-31", "2015-02-28", "2015-03-31", "2015-04-30", "2015-05-31", "2015-06-30", "2015-07-31", "2015-08-31", "2015-09-30"],
       *   "comp_min": 593.2655723290119,
       *   "comp_max": 2142.8640254628417,
       *   "perfmin": -17.46062,
       *   "perfmax": 21.12,
       *   "perfunit": "%",
       *   "compunit": "$"
       * },
       * @param  {Object} options
       * @param  {?Number} options.fund_id          sets default of options.share_class_id -> fund.base_share_class.id
       * @param  {Number}  options.share_class_id   must be set if not options.fund_id
       * @param  {Number}  options.benchmark_id
       * @param  {Number}  options.timeframe_id
       * @return {Promise<object>}                  combined_returns_plot_data
       */
      loadCombinedReturnsPlotData: function(options) {
        var self = this;
        options  = _.extend({
          fund_id:        null,
          share_class_id: null,
          benchmark_id:   null,
          timeframe_id:   null
        }, options);

        var loaded = {};
        if( options.fund_id        ) { Fund.load(options.fund_id);              } // begin loading to avoid async delay
        if( options.share_class_id ) { ShareClass.load(options.share_class_id); } // begin loading to avoid async delay
        if( options.benchmark_id   ) { Index.load(options.benchmark_id); } // begin loading to avoid async delay

        return Benchmarks.load().$loadPromise.then(function(benchmarks) {
          options.benchmark_id = options.benchmark_id || _.get(benchmarks, ['results', 0, 'id']);
          loaded.benchmarks    = benchmarks;
          loaded.benchmark     = Index.load(options.benchmark_id);
          return loaded.benchmark.$loadPromise
        })
        .then(function() {
          if( options.fund_id && !options.share_class_id ) {
            return Fund.load(options.fund_id).$loadPromise.then(function(fund) {
              options.share_class_id = _.get(fund, ['base_share_class', 'id']);
            })
          }
        })
        .then(function() {
          // Short circuit if invalid ids provided - sometimes happens on page transition
          if( !options.share_class_id ) {
            return $q.reject(options);
          }
          loaded.shareClass = ShareClass.load(options.share_class_id);
          return loaded.shareClass.$loadPromise
        })
        .then(function() {
          loaded.timeseries = loaded.shareClass.returns_time_series;
          loaded.fund       = loaded.shareClass.fund;
          return loaded.fund.$loadPromise
        })
        .then(function() {
          // SPEC: Ensure performanceGraph only renders time range for which there is timeseries data (and not just benchmark)
          options.timeframe_id = options.timeframe_id && Math.min(options.timeframe_id, loaded.timeseries.max_timeframe_id)
                                                      || loaded.timeseries.max_timeframe_id || 0;
        })
        .then(function() {
          loaded.timeseries        = loaded.timeseries.timeframe(options.timeframe_id);
          loaded.benchmark_returns = loaded.benchmark.returns_time_series.timeframe(options.timeframe_id);
          loaded.aum_time_series   = loaded.fund.aum_time_series.timeframe(options.timeframe_id);

          // Combine to unify date ranges
          var combined_returns      = TimeSeries.groupByDateObject(loaded.timeseries, loaded.benchmark_returns, loaded.aum_time_series);
          var timeseries_returns    = _(combined_returns).pluck(0).map(function(value) { return value || 0; }).value();
          var benchmark_returns     = _(combined_returns).pluck(1).map(function(value) { return value || 0; }).value();
          var aum_time_series       = _(combined_returns)
            .mapKeys(  function(value, key) {
              // @optimization: moment(key).format('YYYY-MM-DD') is slow - so do string regexp
              var match = key.match(/^\d{4}-\d{2}-\d{2}/);
              if( match ) {
                return match[0];
              } else {
                return moment(key).format('YYYY-MM-DD'); //  combined_returns_plot_data.dates format
              }
            })
            .mapValues(function(array, key) {
              return _.isFinite(array[2]) ? array[2] : null
            })
            .value() // {Object} output
          ;
          var timeseries_compounded = _.values(TimeSeries.toCompounded(timeseries_returns, 1000));
          var benchmark_compounded  = _.values(TimeSeries.toCompounded(benchmark_returns,  1000));
          var dates                 = _.keys(aum_time_series); // = _(combined_returns).keys().map(function(value) { return moment(value).format("YYYY-MM-DD") }).value();

          // computedMeasure = { combined_returns_plot_data: {} }
          var combined_returns_plot_data = {
            aum_time_series: aum_time_series,
            fund: {
              performance: timeseries_returns,
              compounded:  timeseries_compounded
            },
            benchmark: {
              name:        loaded.benchmark.name,
              performance: benchmark_returns,
              compounded:  benchmark_compounded
            },
            timeframe: dates,
            perfmin:  _([timeseries_returns, benchmark_returns]).flatten(true).min(),
            perfmax:  _([timeseries_returns, benchmark_returns]).flatten(true).max(),
            comp_min: _([timeseries_compounded, benchmark_compounded]).flatten(true).min(),
            comp_max: _([timeseries_compounded, benchmark_compounded]).flatten(true).max(),

            perfunit: "%",
            compunit: _.get(loaded, 'fund.latest_aum.symbol') || '$'
          };
          return combined_returns_plot_data;
        })
        ['catch'](function() {
          // Propagate catch to external functions
          return $q.reject(options);
        });
      },

      /**
       * @untested
       * @demo  https://edgefolio-local.com/enterprise/documentation/graphPerformance
       *
       * computedMeasure = {
       *   "id": 374936,
       *   "url": "https://edgefolio.com/api/computed-measures/374936/",
       *
       *   "time_period": 120,
       *   "track_record_years": 10,
       *
       *   "annualized_alpha": -5.091942425302926,
       *   "annualized_compounded_excess_return": -7.978081073026411,
       *   "annualized_compounded_return": -0.8322033830685416,
       *   "annualized_sharpe_ratio": 0.0076928315309794625,
       *   "annualized_sortino_ratio": 0.0125353136946491,
       *   "annualized_volatility": 21.473308995841297,
       *   "benchmark_annualized_compounded_return": 6.954301414751818,
       *   "benchmark_annualized_volatility": 15.176377726447454,
       *   "benchmark_expected_return": 0.6590336666666666,
       *   "benchmark_kurtosis_risk": 2.0730334513066158,
       *   "benchmark_maximum_drawdown": -51.1125932755426916,
       *   "benchmark_skewness_risk": -0.8231298603994012,
       *   "beta": 0.7913714414597214,
       *   "correlation_coefficient": 56.33154480758037,
       *   "cumulative_return": -8.017197226762097,
       *   "data_completeness": 99.16666666666667,
       *   "expected_return": 0.12025210084033616,
       *   "kurtosis_risk": 0.5901303850931748,
       *   "maximum_drawdown": -58.91670460140463,
       *   "skewness_risk": 0.1142024368393561,
       *
       *   "combined_returns_plot_data": {
       *     "benchmark": {
       *       "name": "Russell 1000 TR USD",
       *       "performance": [ -1.75, 3.8, 0.14, 2.8, 0.22, 1.42, 1.2, -2.95, 0.13, 0.22, 2.4, 2.37, 3.4, 2.13, 1.28, 1.93, -1.72, 1.04, 4.2, 3.6, -1.91, -3.09, 1.36, 3.82, 1.74, -4.26, -0.65, -6, -3.06, -0.68, 5.07, 1.83, -8.31, -1.16, 1.38, -9.53, -17.46, -7.56, 1.6, -8.16, -10.34, 8.75, 10.12, 5.53, 0.24, 7.63, 3.63, 4.06, -2.21, 5.89, 2.43, -3.6, 3.3, 6.14, 1.85, -7.93, -5.57, 6.95, -4.47, 9.19, 3.89, 0.33, 6.68, 2.4, 3.48, 0.26, 3.01, -1.07, -1.75, -2.17, -5.76, -7.46, 11.21, -0.26, 0.84, 4.87, 4.39, 3.13, -0.58, -6.15, 3.83, 1.19, 2.43, 2.57, -1.69, 0.79, 1.04, 5.42, 1.34, 3.86, 1.81, 2.22, -1.36, 5.35, -2.76, 3.49, 4.4, 2.81, 2.7, -3.19, 4.75, 0.64, 0.47, 2.3, 2.27, -1.62, 4.13, -1.75, 2.44, 2.62, -0.23, -2.75, 5.78, -1.25, 0.71, 1.31, -1.88, 1.93, -6.02, -2.74],
       *       "compounded": [ 982, 1020, 1021, 1050, 1052, 1067, 1080, 1048, 1049, 1052, 1077, 1102, 1140, 1164, 1179, 1202, 1181, 1193, 1244, 1288, 1264, 1225, 1241, 1289, 1311, 1255, 1247, 1172, 1137, 1129, 1186, 1208, 1108, 1095, 1110, 1004, 829, 766, 778, 715, 641, 697, 767, 810, 812, 874, 906, 942, 922, 976, 1000, 964, 995, 1057, 1076, 991, 936, 1001, 956, 1044, 1084, 1088, 1160, 1188, 1230, 1233, 1270, 1256, 1234, 1208, 1138, 1053, 1171, 1168, 1178, 1235, 1290, 1330, 1322, 1241, 1288, 1304, 1335, 1370, 1347, 1357, 1371, 1446, 1465, 1522, 1549, 1584, 1562, 1646, 1600, 1656, 1729, 1777, 1825, 1767, 1851, 1863, 1872, 1915, 1958, 1926, 2006, 1971, 2019, 2072, 2067, 2010, 2126, 2100, 2115, 2143, 2102, 2143, 2014, 1959]
       *     },
       *     "fund": {
       *       "performance": [ -6.94, 3.45, 0.98, 16.64, -8.44, 5.61, 9.23, -4.75, -2.27, -4.4, -5.4, -12.01, 2.88, 2.66, -1.2, 2.58, -0.51, 5.42, 3.84, 2.31, -1.44, 3.7, -3.18, 5.11, 8.16, -1.12, -0.02, -10.94, 4.75, -1.17, 7.17, 2.53, 21.12, -8.81, -6.53, -13.38, -6.76, -13.71, -7.66, -12.25, -3.75, -3.46, 2.77, 3.51, -8.44, 1.44, -0.05, 6.32, -12.51, 6.54, 3.15, -6.28, 7.81, 9.04, 6.84, -8.21, -6.49, 4.07, -3.92, 13.01, 8.6, 1.99, 5.21, 0.92, 5.51, -0.98, 1.16, -5.16, -5.19, 0.37, -3.12, -12.94, 9.22, -1.16, -2.75, 7.42, 3.1, -2.53, -1.12, -9.37, -0.3, -4.15, 3.42, 1.62, -1.24, -1.01, 0.68, 4.74, -1.93, 7.55, -0.77, 3.92, -2.52, 5.12, -1.34, 10.2, 2.39, 3.98, 7.12, -1.82, 6.61, -3.11, -3.06, 2.25, 3.85, -4.27, 2.25, 0.37, 2.51, 1.38, -1.76, -5.39, 3.45, -2.34, -4.12, 2.87, -7.03, 5.83, -7.46, 0],
       *       "compounded":  [ 931, 963, 972, 1134, 1038, 1096, 1198, 1141, 1115, 1066, 1008, 887, 913, 937, 926, 950, 945, 996, 1034, 1058, 1043, 1081, 1047, 1101, 1190, 1177, 1177, 1048, 1098, 1085, 1163, 1192, 1444, 1317, 1231, 1066, 994, 858, 792, 695, 669, 646, 664, 687, 629, 638, 638, 678, 593, 632, 652, 611, 659, 718, 767, 704, 659, 686, 659, 744, 808, 824, 867, 875, 924, 915, 925, 877, 832, 835, 809, 704, 769, 760, 739, 794, 819, 798, 789, 715, 713, 683, 707, 718, 709, 702, 707, 741, 726, 781, 775, 805, 785, 825, 814, 897, 919, 955, 1023, 1005, 1071, 1038, 1006, 1029, 1068, 1023, 1046, 1050, 1076, 1091, 1072, 1014, 1049, 1024, 982, 1010, 939, 994, 920, 920]
       *     },
       *     "timeframe": [ "2005-10-31", "2005-11-30", "2005-12-31", "2006-01-31", "2006-02-28", "2006-03-31", "2006-04-30", "2006-05-31", "2006-06-30", "2006-07-31", "2006-08-31", "2006-09-30", "2006-10-31", "2006-11-30", "2006-12-31", "2007-01-31", "2007-02-28", "2007-03-31", "2007-04-30", "2007-05-31", "2007-06-30", "2007-07-31", "2007-08-31", "2007-09-30", "2007-10-31", "2007-11-30", "2007-12-31", "2008-01-31", "2008-02-29", "2008-03-31", "2008-04-30", "2008-05-31", "2008-06-30", "2008-07-31", "2008-08-31", "2008-09-30", "2008-10-31", "2008-11-30", "2008-12-31", "2009-01-31", "2009-02-28", "2009-03-31", "2009-04-30", "2009-05-31", "2009-06-30", "2009-07-31", "2009-08-31", "2009-09-30", "2009-10-31", "2009-11-30", "2009-12-31", "2010-01-31", "2010-02-28", "2010-03-31", "2010-04-30", "2010-05-31", "2010-06-30", "2010-07-31", "2010-08-31", "2010-09-30", "2010-10-31", "2010-11-30", "2010-12-31", "2011-01-31", "2011-02-28", "2011-03-31", "2011-04-30", "2011-05-31", "2011-06-30", "2011-07-31", "2011-08-31", "2011-09-30", "2011-10-31", "2011-11-30", "2011-12-31", "2012-01-31", "2012-02-29", "2012-03-31", "2012-04-30", "2012-05-31", "2012-06-30", "2012-07-31", "2012-08-31", "2012-09-30", "2012-10-31", "2012-11-30", "2012-12-31", "2013-01-31", "2013-02-28", "2013-03-31", "2013-04-30", "2013-05-31", "2013-06-30", "2013-07-31", "2013-08-31", "2013-09-30", "2013-10-31", "2013-11-30", "2013-12-31", "2014-01-31", "2014-02-28", "2014-03-31", "2014-04-30", "2014-05-31", "2014-06-30", "2014-07-31", "2014-08-31", "2014-09-30", "2014-10-31", "2014-11-30", "2014-12-31", "2015-01-31", "2015-02-28", "2015-03-31", "2015-04-30", "2015-05-31", "2015-06-30", "2015-07-31", "2015-08-31", "2015-09-30"],
       *     "comp_min": 593.2655723290119,
       *     "comp_max": 2142.8640254628417,
       *     "perfmin": -17.46062,
       *     "perfmax": 21.12,
       *     "perfunit": "%",
       *     "compunit": "$"
       *   },
       *
       *   "risk_free_index": {
       *     "id": 23,
       *     "name": "USTREAS T-Bill Auction Ave 3 Mon",
       *     "url": "https://edgefolio.com/api/indices/23/",
       *     "description": "The index measures the performance of the average investment rate of US T-Bills securities with the maturity of 3 months.",
       *     "classification": {
       *       "alternative_sector": "6",
       *       "asset_class_orientation": "Diverse",
       *       "sector_orientation": "2",
       *       "region_orientation": "8",
       *       "weighting_scheme": null
       *     },
       *     "performance_type": "",
       *     "trading_symbol": null
       *   },
       *   "benchmark": {
       *     "id": 12,
       *     "name": "Russell 1000 TR USD"
       *     "url": "https://edgefolio.com/api/indices/12/",
       *     "description": "The index measures the performance of the large-cap segment of the US equity securities. It is a subset of the Russell 3000 index and includes approximately 1000 of the largest securities based on a combination of their market cap and current index membership.",
       *     "classification": {
       *       "alternative_sector": null,
       *       "asset_class_orientation": "Equity",
       *       "sector_orientation": "0",
       *       "region_orientation": "8",
       *       "weighting_scheme": "3"
       *     },
       *     "performance_type": "",
       *     "trading_symbol": null,
       *   },
       *   "hedge_fund": {
       *     "id": 9704,
       *     "url": "https://edgefolio.com/api/hedge-funds/9704/",
       *     "name": "HCM Classic Hedge",
       *     "aum": {
       *       "currency": "USD",
       *       "amount": 9695486
       *     },
       *     "strategy": "U.S. Long/Short Equity",
       *     "year_to_date": "-14.16",
       *     "is_edited_by_manager": false,
       *     "base_share_class": {
       *       "id": 7631
       *     }
       *   },
       *
       *   "share_class": {
       *     "id": 7631,
       *     "url": "https://edgefolio.com/api/share-classes/7631/",
       *     "currency": "USD",
       *     "is_base_class": true,
       *     "name": "HCM Classic Hedge"
       *   }
       * };
       *
       * @param  {Object}  options
       * @param  {?Number} options.fund_id          sets default of options.share_class_id -> fund.base_share_class.id
       * @param  {Number}  options.share_class_id   must be set if not options.fund_id
       * @param  {Number}  options.benchmark_id
       * @param  {Number}  options.timeframe_id
       * @return {Promise<object>}                  computedMeasure
       */
      loadComputedMeasure: function(options) {
        var self = this;
        options  = _.extend({
          fund_id:        null,
          share_class_id: null,
          benchmark_id:   null,
          timeframe_id:   null
        }, options);

        return $q.when()
        .then(function() {
          if( options.fund_id && !options.share_class_id ) {
            return Fund.load(options.fund_id).$loadPromise.then(function(fund) {
              options.share_class_id = _.get(fund, ['base_share_class', 'id']);
              return fund;
            })
          } else {
            return $q.when()
          }
        })
        .then(function() {
          // Short circuit if invalid ids provided - sometimes happens on page transition
          if( !options.share_class_id ) {
            return $q.reject(options);
          }
          return $q.all({
            share_class: ShareClass.load(options.share_class_id).$loadPromise,
            benchmarks:  Benchmarks.load().$loadPromise
          })
        })
        .then(function(loaded) {
          options.benchmark_id = options.benchmark_id || _.get(loaded.benchmarks, ['results', 0, 'id']);

          return $q.all({
            benchmarks:  loaded.benchmarks.$loadPromise,
            share_class: loaded.share_class.$loadPromise,
            fund:        loaded.share_class.fund.$loadPromise,
            benchmark:   Index.load(options.benchmark_id).$loadPromise,
            combined_returns_plot_data: ShareClass.loadCombinedReturnsPlotData({
              share_class_id: options.share_class_id,
              benchmark_id:   options.benchmark_id,
              timeframe_id:   options.timeframe_id
            })
          })
        })
        .then(function(loaded) {
          var computedMeasure = {};
          computedMeasure = _.extend(computedMeasure,
            loaded.share_class.$statistics(options)
          );
          computedMeasure = _.extend(computedMeasure, _.mapKeys(
            loaded.benchmark.returns_time_series.$statistics(options),
            function(value, key) { return "benchmark_" + key; }
          ));
          computedMeasure = _.extend(computedMeasure, {
            "time_period":                options.timeframe_id,
            "track_record_years":         options.timeframe_id / 12 || 0,
            "combined_returns_plot_data": loaded.combined_returns_plot_data,
            "risk_free_index":            loaded.fund.risk_free_index,
            "benchmark":                  loaded.benchmark,
            "hedge_fund":                 loaded.fund,
            "share_class":                loaded.share_class
          });
          return computedMeasure;
        })
        ['catch'](function(error) {
          !options.silent && console.error("ShareClass.js::loadComputedMeasure()", options, error);
        });
      },
      loadAnalysisData: function(options) {
        // TODO: Replace hardcoded data with api endpoint
        return $q.when({
          "aggregations": {
            "beta":                                { "values": { "5.0": -0.011378890077979346, "25.0":   0.2590640709270656,  "50.0":   0.5568018295490429,   "75.0":   0.8321122521671087,  "95.0":  1.2065789034873509  } },
            "annualized_volatility":               { "values": { "5.0":  4.386722419896362,    "25.0":   9.503835341720041,   "50.0":  14.216886028397294,    "75.0":  17.884822318333182,   "95.0": 29.2080784069086     } },
            "skewness_risk":                       { "values": { "5.0": -1.255198823976933,    "25.0":  -0.7420517278702031,  "50.0":  -0.26548084380863624,  "75.0":   0.1712817184033512,  "95.0":  1.2597839582770636  } },
            "annualized_sharpe_ratio":             { "values": { "5.0": -0.1704695494927714,   "25.0":   0.13384837976899072, "50.0":   0.38241910324157596,  "75.0":   0.667940016074366,   "95.0":  1.0674025733710664  } },
            "annualized_compounded_excess_return": { "values": { "5.0": -9.97300542023482,     "25.0":  -5.290055477238276,   "50.0":  -2.6815142348382173,   "75.0":   0.799480525493157,   "95.0":  4.875374769528348   } },
            "annualized_compounded_return":        { "values": { "5.0": -3.7821643427842613,   "25.0":   1.8300789909024118,  "50.0":   5.043230306275348,    "75.0":   8.388993722755039,   "95.0": 13.901157973562539   } },
            "correlation_coefficient":             { "values": { "5.0": -2.362587387422491,    "25.0":  37.36150149594646,    "50.0":  57.97168974212245,     "75.0":  73.18781080572623,    "95.0": 86.90926969406661    } },
            "expected_return":                     { "values": { "5.0": -0.15179075630252098,  "25.0":   0.28697943600517134, "50.0":   0.4844944957983194,   "75.0":   0.8162653508771929,  "95.0":  1.3412492690058482  } },
            "annualized_alpha":                    { "values": { "5.0": -7.778369685812743,    "25.0":  -1.6764362401012405,  "50.0":   1.3556088111789848,   "75.0":   5.223031583446895,   "95.0": 11.150750952759141   } },
            "kurtosis_risk":                       { "values": { "5.0": -0.057336449316577776, "25.0":   1.074393791431112,   "50.0":   2.2758422924742976,   "75.0":   4.198839976473933,   "95.0": 11.360218777410434   } },
            "maximum_drawdown":                    { "values": { "5.0": -73.34988797955162,    "25.0": -52.276863409493835,   "50.0": -31.70667554825193,     "75.0": -21.337774698939036,   "95.0": -6.1956574700649485  } },
            "annualized_sortino_ratio":            { "values": { "5.0": -0.23078307230783285,  "25.0":   0.1892764198964992,  "50.0":   0.5300898471923283,   "75.0":   0.9312279495393041,  "95.0":  1.952475164398659   } }
          }
        })
      },
      /**
       * V3 version of ElasticSearchService.getAnalysisData()
       * @param options
       * @returns {*}
       */
      getAnalysisData: function(options) {
        var self = this;
        options = _.extend({
          //service:    'ElasticSearchService',
          percents:   [0, 25, 50, 75, 100],
          //isBaseShareClass: true,
          timeframe:  null,
          benchmark:  null,
          hedgeFunds: null,
          //strategy:   _(options).get('hedgeFundDetails.strategy') || null,
          //hedgeFundDetails: null,
          sort:       null, // { name: 'annualized_compounded_return', desc: true },
          size:       0
        }, options);

        var promises = _.map(options.hedgeFunds, function(fund_id) {
          var config = {
            fund_id:        _.isFinite(Number(fund_id)) ? Number(fund_id) : _.get(fund_id, 'id'),
            percents:       options.percents,
            benchmark_id:   options.benchmark_id || _.isFinite(Number(options.benchmark)) ? Number(options.benchmark) : _.get(options.benchmark, 'id'),
            timeframe_id:   options.timeframe_id || _.isFinite(Number(options.timeframe)) ? Number(options.timeframe) : _.get(options.timeframe, 'id'),
            silent:         true
          };
          return self.loadComputedMeasure(config)['catch'](_.noop);
        });
        return $q.all(promises).then(function(computedMeasures) {
          computedMeasures = _.filter(computedMeasures);


          // Ensure all data arrays are mapped to the same length
          // BUGFIX: performanceGraph was rendering graphs incorrectly when data sources had different timeframes
          var computedMeasureDates = _(computedMeasures)
            .pluck('combined_returns_plot_data.timeframe')
            .flatten()
            .unique()
            .sortBy()
            .value()
          ;
          _(computedMeasures).value().forEach(function(fund) {
            _.each([
              //'combined_returns_plot_data.aum_time_series',  // This is an timeseries_object rather than an array
              'combined_returns_plot_data.fund.performance',
              'combined_returns_plot_data.fund.compounded',
              'combined_returns_plot_data.benchmark.performance',
              'combined_returns_plot_data.benchmark.compounded'
            ], function(arrayKey) {
              var timeseriesInputArray = _.get(fund, arrayKey);
              var timeframes = _.get(fund, 'combined_returns_plot_data.timeframe');

              var lastValue = _.contains(arrayKey, 'compounded') ? 1000 : 0;
              var timeseriesOutputArray = _(computedMeasureDates)
                .indexBy()
                .mapValues(function(dateString) {
                  var index = _.indexOf(timeframes, dateString);
                  var output;
                  if( index !== -1 && _.isFinite(timeseriesInputArray[index]) ) {
                    output = timeseriesInputArray[index];
                  } else {
                    output = lastValue;
                  }
                  lastValue = output;
                  return output;
                })
                .values()
                .value()
              ;
              _.set(fund, arrayKey, timeseriesOutputArray);
            });
            _.set(fund, 'combined_returns_plot_data.timeframe', computedMeasureDates);
          });


          if( options.sort ) {
            if( options.sort.name ) {
              computedMeasures = _.sortBy(computedMeasures, options.sort.name);
            }
            if( options.sort.desc ) {
              computedMeasures = Array.reverse(computedMeasures);
            }
          }
          if( options.size ) {
            computedMeasures = _.take(computedMeasures, options.size);
          }
          computedMeasures = _.map(computedMeasures, function(computedMeasure) {
            return {
              _id:     computedMeasure.id,
              _index:  null,
              _score:  0,
              _type:   "computed-measures",
              _source: computedMeasure
            };
          });
          return { hits: { hits: computedMeasures } };
        });
      }
    }
  });
  return ShareClass;
});
