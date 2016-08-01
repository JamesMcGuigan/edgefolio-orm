/**
 * Class based reimpleme ntation of /api/src/compute/measures/tasks.py
 */
angular.module('edgefolio.models').factory('TimeSeries', function(
  $q, kurtosis, covariance,
  Edgefolio, ApiFieldGenerator, DateBucket, AggregationDefinitions // NOTE: Injecting "Fund" causes a DI injection loop
) {
  var TimeSeries = new JS.Class("TimeSeries", DateBucket, {

    /**
     * Defines the getter/setter mappings for this.data
     * Gets run on original initialization, and again after this.$setData(),
     * as this function may depend on the keys in this.data
     *
     * Extend $initializeObjectProperties with additional Object.defineProperty() specifications
     * NOTE: remember to also call: this.callSuper()
     */
    $initializeObjectProperties: function() {
      this.callSuper();
    },

    /**
     * COPY/PASTE: Fund.$statistics()
     * @param   {Object} options
     * @returns {Object}
     */
    $statistics: function(options) {
      options = _.extend({
        fund_returns: this
      }, options);
      var output = this.klass.statistics(options);

      return output;
    },


    toCalc: function(options) {
      return new this( this.klass.toCalc(this), { prevalidated: true });
    },
    fromCalc: function(options) {
      return new this( this.klass.toCalc(this), { prevalidated: true });
    },
    groupByDateObject: function(options) {
      return new this( this.klass.groupByDateObject([this, arguments]), { prevalidated: true });
    },


    excess: function(options) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns && !options.risk_free_returns ) { return null; }
      return this.klass.excess(options);
    },
    mean: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.mean(options);
    },
    expected_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.expected_return(options);
    },
    standard_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.standard_deviation(options);
    },
    annualized_standard_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_standard_deviation(options);
    },
    annualized_volatility: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_volatility(options);
    },
    downside_deviation: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.downside_deviation(options);
    },
    skewness: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.skewness(options);
    },
    kurtosis: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.kurtosis(options);
    },
    period_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.period_return(options);
    },
    annualized_compounded_return: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.annualized_compounded_return(options);
    },
    annualized_period_return: function( options ) {
      options = _.extend({ fund_returns: this, track_record_years: 0 }, options);
      return this.klass.annualized_period_return(options);
    },
    maximum_drawdown: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      return this.klass.maximum_drawdown(options);
    },
    sharpe_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.sharpe_ratio(options);
    },
    annualized_sharpe_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_sharpe_ratio(options);
    },
    sortino_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.risk_free_returns ) { return null; }
      return this.klass.sortino_ratio(options);
    },
    annualized_sortino_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      return this.klass.annualized_sortino_ratio(options);
    },
    correlation_coefficient: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      return this.klass.correlation_coefficient(options);
    },
    beta: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.beta(options);
    },
    annualized_beta: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_beta(options);
    },
    alpha: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.alpha(options);
    },
    annualized_alpha: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.annualized_alpha(options);
    },
    information_ratio: function( options ) {
      options = _.extend({ fund_returns: this }, options);
      if( !options.benchmark_returns ) { return null; }
      if( !options.risk_free_returns ) { return null; }
      return this.klass.information_ratio(options);
    },


    //----- TimeSeries Klass Methods -----//
    extend: {
      // mappingKlass: TimeSeriesValue,

      /**
       * COPY/PASTE: TimeSeries.$statistics()
       * NOTE: Assumes all data structures have been pre-loaded, doesn't return a promise
       *
       * @param   {Object} options
       * @returns {Object}
       */
      statistics: function(options) {
        options = options || {};

        options.fund            = options.fund            || options.fund_id            && Edgefolio.Fund.load(options.fund_id)              || null;
        options.share_class     = options.share_class     || options.share_class_id     && Edgefolio.ShareClass.load(options.share_class_id) || null;
        options.benchmark       = options.benchmark       || options.benchmark_id       && Edgefolio.Index.load(options.benchmark_id)        || null;
        options.risk_free_index = options.risk_free_index || Edgefolio.Index.load(options.risk_free_index_id || Edgefolio.Fund.risk_free_index_id) || null; // Hardcoded Fund.risk_free_index == 63304

        options.fund            = options.fund            || _.get(options.share_class, 'fund');
        options.share_class     = options.share_class     || _.get(options.fund, 'base_share_class');
        options.benchmark       = options.benchmark       || _.get(options.fund, 'category_benchmark_index');
        options.risk_free_index = options.risk_free_index || _.get(options.fund, 'risk_free_index');

        options = {
          fund_returns:      options.fund_returns      || _.get(options.share_class,     'returns_time_series') || null,
          benchmark_returns: options.benchmark_returns || _.get(options.benchmark,       'returns_time_series') || null,
          risk_free_returns: options.risk_free_returns || _.get(options.risk_free_index, 'returns_time_series') || null,
          timeframe_id:      options.timeframe_id      || 0
        };
        // Clip statistics() to only contain timerange of options.fund_returns, not for the full history of the benchmark
        if( _.get(options, 'fund_returns.max_timeframe_id') ) {
          options.timeframe_id = ( options.timeframe_id === 0 )
                               ? options.fund_returns.max_timeframe_id
                               : Math.min(options.fund_returns.max_timeframe_id, options.timeframe_id) || 0
        }
        this.invokeTimeframeOptions(options);

        var output = _.mapValues(AggregationDefinitions, function(aggregation) {
          if( _.isFunction(this[aggregation.id]) ) {
            return this[aggregation.id](options);
          }
          return null;
        }, this);
        return output;
      },


      /**
       * @tested
       * @shared_task
       * def excess_returns(fund_returns, benchmark_returns):
       *  return fund_returns - benchmark_returns
       *
       * @param   {?DateBucket}  options.fund_returns
       * @param   {?DateBucket}  options.benchmark_returns
       * @param   {?DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {TimeSeries}
       */
      excess: function(options) {
        options = this.invokeTimeframeOptions(options);
        var array_of_returns = _([options.fund_returns, options.benchmark_returns, options.risk_free_returns])
          .filter()
          .take(2)
          .value()
        ;
        var returns = this.groupByDateObject(array_of_returns);
        var excess = _(returns)
          .thru(this.toCalc, this)
          .mapValues(function(values_array, date) {
            if( _.isFinite(values_array[0]) && _.isFinite(values_array[1]) ) {
              return values_array[0] - values_array[1];
            } else {
              return null;
            }
          })
          .thru(this.fromCalc, this)
          .value();

        return new this(excess, { prevalidated: true });
      },

      /**
       * @tested
       * @shared_task
       * def arithmetic_mean(returns):
       *     return returns.mean()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      mean: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          return ss.mean(values_array);
        });
      },
      /**
       * expected_return: simply the arithmetic mean of the series in the time frame under consideration.
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      expected_return: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.mean(options);
      },


      /**
       * @tested
       * @shared_task
       * def standard_deviation(returns):
       *     return returns.std()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      standard_deviation: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
          return ss.sampleStandardDeviation(values_array);
        });
      },


      /**
       * @tested
       * @shared_task
       * def annualized_standard_deviation(returns):
       *    return math.sqrt(12) * standard_deviation(returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_standard_deviation: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return Math.sqrt(12) * this.standard_deviation(options);
      },

      /**
       * annualized_volatility: sqrt(12) * standard_deviation(returns) in the time frame under consideration.
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_volatility: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.annualized_standard_deviation(options);
      },


      /**
       * @tested
       * @shared_task
       * def downside_deviation(returns, mar=0.0):
       *     mask = returns < mar
       *     downside_diff = returns[mask] - mar
       *     if len(downside_diff) <= 1:
       *         return 0.0
       *     return np.std(downside_diff, ddof=1)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {Number}      options.margin
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      downside_deviation: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        var margin       = options.margin || 0;
        if( !_.isObject(fund_returns) ) { return null; }

        margin = _.isFinite(margin) ? margin : 0;

        return _(fund_returns)
          .values()
          .reject(_.isNull)
          .thru(this.toCalc, this)                           // n = n/100
          .filter(function(value) { return value < margin }) // mask = returns < mar
          .map(function(value)    { return value - margin }) // downside_diff = returns[mask] - mar
          .thru(function(values_array) {
            return ss.sampleStandardDeviation(values_array); // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
          })
          // .thru(function(values_array) {
          //   /**
          //    * @unused
          //    * @tested against ss.sampleStandardDeviation()
          //    * np.std:
          //    *   The standard deviation is the square root of the average of the squared deviations from the mean,
          //    *   i.e., std = sqrt(mean(abs(x - x.mean())**2)).
          //    *
          //    *   The average squared deviation is normally calculated as x.sum() / N, where N = len(x).
          //    *   If, however, ddof is specified, the divisor N - ddof is used instead.
          //    *   In standard statistical practice,
          //    *       ddof=1 provides an unbiased estimator of the variance of the infinite population.
          //    *       ddof=0 provides a maximum likelihood estimate of the variance for normally distributed variables.
          //    *
          //    *    The standard deviation computed in this function is the square root of the estimated variance,
          //    *    so even with ddof=1, it will not be an unbiased estimate of the standard deviation per se.
          //    *
          //    * @doc https://docs.scipy.org/doc/numpy-1.10.0/reference/generated/numpy.std.html
          //    * @doc http://simplestatistics.org/docs/#samplestandarddeviation
          //    */
          //
          //   var ddof = 1;
          //   if( values_array.length - ddof > 0 ) {
          //     var x_mean   = ss.mean(values_array) || 0;
          //     var abs      = values_array.map(function(x) { return Math.pow(x - x_mean, 2); }).sum(); // using Array.prototype rather than _.lodash()
          //     var variance = abs / (values_array.length - ddof);
          //     var rms      = Math.sqrt(variance);
          //     return rms;
          //   } else {
          //     return 0;
          //   }
          // })
          .thru(function(value) { return _.isFinite(value) ? value : 0; }) // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)  // n = n*100                         // n = n * 100
          .value();
      },

      /**
       * @untested
       * @shared_task
       * def skewness(returns):
       *     return returns.skew()
       *
       * @doc https://docs.scipy.org/doc/scipy-0.14.0/reference/generated/scipy.stats.skew.html - Unknown Implementation
       * @doc http://simplestatistics.org/docs/#sampleskewness - Fisher-Pearson
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      skewness: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          return ss.sampleSkewness(values_array); // ss.sampleStandardDeviation() uses x.sum()/N-1 | ss.standardDeviation() uses x.sum()/N
        });
      },

      /**
       * @untested
       * @shared_task
       * def kurtosis(returns):
       *     return returns.kurtosis()
       *
       * @doc https://github.com/compute-io/kurtosis
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      kurtosis: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return kurtosis(fund_returns); // compute-io/kurtosis
      },

      /**
       * @tested
       * @shared_task
       * def period_return(returns):
       *     return ((1.0 + returns/100.0).prod() - 1.0)*100.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      period_return: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns = options.fund_returns || null;
        if( !_.isObject(fund_returns) ) { return null; }

        return this.thruCalcToNumber(fund_returns, function(values_array) {
          // TODO: implement product in simple-statistics
          var product = _.reduce(values_array, function(product, returns) {
            return product * (1 + returns);
          }, 1) - 1;

          return _.isFinite(product) ? product : 0;
        });
      },
      /**
       * TODO: verify this is the correct mapping
       * annualized_compounded_return: (1.0 + returns_series/100.0).cumprod()
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_compounded_return: function(options) {
        //options = this.invokeTimeframeOptions(options);
        return this.annualized_period_return(options);
      },

      /**
       * @untested
       * @shared_task
       * def annualized_period_return(returns, track_record_years):
       *     if track_record_years > 0:
       *         cumulative_growth = (1.0 + returns/100.0).prod()
       *         annualized_period_return = (cumulative_growth**(1.0/track_record_years) - 1.0)*100.0
       *         return annualized_period_return
       *     else:
       *         return 0.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {Number}      options.track_record_years
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_period_return: function(options) {
        if( !_.isObject(options && options.fund_returns) ) { return null; }

        var track_record_years = (options.fund_returns.max_timeframe_id + 1) / 12 || 1;
        var period_return = 1 + this.toCalc(this.period_return(options));
        var annualized_period_return = Math.pow(period_return, (1/track_record_years)) - 1;
        return this.fromCalc(annualized_period_return) || 0;
      },

      /**
       * @untested
       * @shared_task
       * def maximum_drawdown(returns):
       *     compounded_returns = []
       *     cur_return = 0.0
       *
       *     for r in returns:
       *         try:
       *             cur_return += math.log(1.0 + r/100.0)
       *         # This is a guard for a single day returning -100%
       *         except ValueError:
       *             # TODO: Log the following properly
       *             print("{cur} return, zeroing the returns".format(cur=cur_return))
       *             cur_return = 0.0
       *         compounded_returns.append(cur_return)
       *
       *     cur_max = None
       *     max_drawdown = None
       *
       *     for cur in compounded_returns:
       *         if cur_max is None or cur > cur_max:
       *             cur_max = cur
       *
       *         drawdown = (cur - cur_max)
       *         if max_drawdown is None or drawdown < max_drawdown:
       *             max_drawdown = drawdown
       *
       *     if max_drawdown is None:
       *         return 0.0
       *
       *     return -(1.0 - math.exp(max_drawdown))*100.0
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      maximum_drawdown: function(options) {
        options = this.invokeTimeframeOptions(options);
        if( !_.isObject(options.fund_returns) ) { return null; }

        var fund_returns       = _.values(options.fund_returns) || null;
        var compounded_returns = [];
        var cur_return         = 0.0;

        // for( var r in returns ) {
        compounded_returns = _.map(fund_returns, function(r) {
          cur_return += Math.log(1.0 + r / 100.0) || 0; // Math.log(-1) === NaN
          return cur_return;
        });

        var cur_max      = null;
        var max_drawdown = null;

        _.each(compounded_returns, function(cur) {
          if( cur_max === null || cur > cur_max ) {
            cur_max = cur;
          }

          var drawdown = (cur - cur_max);
          if( max_drawdown === null || drawdown < max_drawdown ) {
            max_drawdown = drawdown
          }
        });

        if( max_drawdown === null ) {
          return 0; // Javascript: All numbers are implicitly floating point to double precision
        } else {
          return -( 1 - Math.exp(max_drawdown) ) * 100;
        }
      },

      /**
       * @untested
       * @shared_task
       * def sharpe_ratio(fund_returns, risk_free_returns):
       *     excess_returns_series = excess_returns(fund_returns, risk_free_returns)
       *     expected_value = arithmetic_mean(excess_returns_series)
       *     monthly_volatility = standard_deviation(excess_returns_series)
       *
       *     if approx_equals(monthly_volatility, 0):
       *         return 0.0
       *
       *     return expected_value/monthly_volatility
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null} in range (0.00, 1.00)
       */
      sharpe_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var excess_returns_series = this.excess({ fund_returns: fund_returns, risk_free_returns: risk_free_returns });
        var expected_value        = excess_returns_series.mean();
        var monthly_volatility    = excess_returns_series.standard_deviation();

        // Verify: is proximity check required
        var proximity = 0.00001;
        if( 0 - proximity <= monthly_volatility && monthly_volatility <= proximity + 0 ) {
          return 0;
        } else {
          return expected_value / monthly_volatility; // display value is {0.00,1.00}
        }
      },

      /**
       * @untested
       * @shared_task
       * def annualized_sharpe_ratio(fund_returns, risk_free_returns):
       *     return math.sqrt(12)*sharpe_ratio(fund_returns, risk_free_returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_sharpe_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        return Math.sqrt(12) * this.sharpe_ratio(options);
      },

      /**
       * @untested
       * @shared_task
       * def sortino_ratio(fund_returns, risk_free_returns, minimum_acceptable_return=0.0):
       *     excess_returns_series = excess_returns(fund_returns, risk_free_returns)
       *     expected_value = arithmetic_mean(excess_returns_series)
       *     monthly_downside_deviation = downside_deviation(excess_returns_series, mar=0.0)
       *
       *     if approx_equals(monthly_downside_deviation, 0):
       *         return 0.0
       *
       *     return expected_value/monthly_downside_deviation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      sortino_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var excess_returns_series      = this.excess({ fund_returns: fund_returns, risk_free_returns: risk_free_returns });
        var expected_value             = excess_returns_series.mean();
        var monthly_downside_deviation = this.downside_deviation(excess_returns_series, 0);

        // Verify: is proximity check required
        var proximity = 0.00001;
        if( 0 - proximity <= monthly_downside_deviation && monthly_downside_deviation <= proximity + 0 ) {
          return 0;
        } else {
          return this.toCalc(expected_value / monthly_downside_deviation);
        }
      },

      /**
       * @untested
       * @shared_task
       * def annualized_sortino_ratio(fund_returns, benchmark_returns):
       *     return math.sqrt(12)*sortino_ratio(fund_returns, benchmark_returns)
       *
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_sortino_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return Math.sqrt(12) * this.sortino_ratio(options);
      },

      /**
       * @tested
       * @shared_task
       * def correlation_coefficient(fund_returns, benchmark_returns):
       *     return np.corrcoef(fund_returns, benchmark_returns)[0][1]*100.0
       *
       * @doc http://simplestatistics.org/docs/#samplecorrelation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      correlation_coefficient: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return _([fund_returns,benchmark_returns])
          //.thru(this.toCalc, this)    // ss.sampleCorrelation() is scale independent
          .thru(this.groupByDateObject, this) // = { "timestamp": [fund_value, benchmark_value], ... }
          .reject(function(row) {
            // ss.sampleCorrelation returns NaN if any inputs are null
            for( var i=0, n=row.length; i<n; i++ ) {
              if( row[i] === null || row[i] === undefined ) {
                return true;
              }
            }
            return false;
            //return _.any(row, _.isNull);
          })
          .thru(function(group_by_date) {
            return ss.sampleCorrelation(
              _.pluck(group_by_date, 0),
              _.pluck(group_by_date, 1)
            );
          })
          .thru(this.fromCalc, this) // ss.sampleCorrelation() returns (1,-1) || NaN || undefined - needs to be converted back to 1 = 1% format
          .value();
      },

      /**
       * @untested
       * @shared_task
       * def beta(fund_returns, benchmark_returns, risk_free_returns):
       *     # For fewer than two months, don't calculate anything
       *     if len(fund_returns) < 2:
       *         return 0.0
       *
       *     fund_excess_returns = excess_returns(fund_returns, risk_free_returns)
       *     benchmark_excess_returns = excess_returns(benchmark_returns, risk_free_returns)
       *     returns_matrix = np.vstack([fund_excess_returns, benchmark_excess_returns])
       *     C = np.cov(returns_matrix, ddof=1)
       *     excess_returns_covariance = C[0][1]
       *     benchmark_excess_returns_variance = C[1][1]
       *
       *     return excess_returns_covariance/benchmark_excess_returns_variance
       *
       * @doc https://docs.scipy.org/doc/numpy-1.10.1/reference/generated/numpy.cov.html
       * @doc https://docs.scipy.org/doc/numpy-1.10.1/reference/generated/numpy.vstack.html
       * @doc https://github.com/compute-io/covariance
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      beta: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }
        if( fund_returns.size() < 2 ) { return 0; } // For fewer than two months, don't calculate anything

        var fund_excess_returns      = this.excess({ fund_returns:      fund_returns,      risk_free_returns: risk_free_returns });
        var benchmark_excess_returns = this.excess({ benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns });
        var returns_matrix           = this.groupByDateObject(fund_excess_returns, benchmark_excess_returns); // was numpy.vstack:

        // @doc https://github.com/compute-io/covariance
        //      By default, each element of the covariance matrix is an unbiased covariance estimate.
        //      Hence, the covariance matrix is the sample covariance matrix.
        //      For those cases where you want a biased estimate (i.e., population statistics), set the bias option to true.
        // WAS: np.cov(returns_matrix, ddof=1);
        //
        // NOTE: this.groupByDateObject() ensures the two _.pluck() arrays are the same size and date matching pairs
        //
        // TODO: input format of compute-io/covariance is different from np.cov()
        try {
          var C = covariance(
            this.toCalc(_.pluck(returns_matrix, 0)),
            this.toCalc(_.pluck(returns_matrix, 1)),
            { bias: true }
          );

          // TODO: verify that output format of compute-io/covariance is same as np.cov()
          // Test Data === [ [0.000016099930962771668,0], [0,0] ]
          var excess_returns_covariance         = C[0][1];
          var benchmark_excess_returns_variance = C[1][1];

        } catch(exception) {
          console.error("TimeSeries.beta()", "exception", exception);
        }

        var beta = excess_returns_covariance / benchmark_excess_returns_variance || 0;
        return beta; // NOT: this.fromCalc(beta);
      },
      /**
       * @untested
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_beta: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }

        return 12 * this.beta(options);
      },


      /**
       * @untested
       * @shared_task
       * def alpha(fund_returns, benchmark_returns, risk_free_returns):
       *     fund_expected_excess_returns = arithmetic_mean(excess_returns(fund_returns, risk_free_returns))
       *     benchmark_expected_excess_returns = arithmetic_mean(excess_returns(benchmark_returns, risk_free_returns))
       *     beta_ = beta(fund_returns, benchmark_returns, risk_free_returns)
       *     return fund_expected_excess_returns - beta_*benchmark_expected_excess_returns
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      alpha: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        var risk_free_returns = options.risk_free_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) || !_.isObject(risk_free_returns) ) { return null; }

        var fund_expected_excess_mean      = this.excess({ fund_returns:      fund_returns,      risk_free_returns: risk_free_returns }).mean();
        var benchmark_expected_excess_mean = this.excess({ benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns }).mean();
        var beta                           = this.beta({   fund_returns: fund_returns, benchmark_returns: benchmark_returns, risk_free_returns: risk_free_returns });

        return fund_expected_excess_mean - (beta * benchmark_expected_excess_mean);
      },


      /**
       * @untested
       * @shared_task
       * def annualized_alpha(fund_returns, benchmark_returns, risk_free_returns):
       *     return 12*alpha(fund_returns, benchmark_returns, risk_free_returns)
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {DateBucket}  options.risk_free_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      annualized_alpha: function(options) {
        return 12 * this.alpha(options);
      },

      /**
       * @untested
       * @shared_task
       * def information_ratio(fund_returns, benchmark_returns):
       *     relative_returns = fund_returns - benchmark_returns
       *     relative_deviation = relative_returns.std(ddof=1)
       *
       *     if approx_equals(relative_deviation, 0) or np.isnan(relative_deviation):
       *         return 0.0
       *
       *     return np.mean(relative_returns)/relative_deviation
       *
       * @param   {DateBucket}  options.fund_returns
       * @param   {DateBucket}  options.benchmark_returns
       * @param   {?Number}     options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Number|null}
       */
      information_ratio: function(options) {
        options = this.invokeTimeframeOptions(options);
        var fund_returns      = options.fund_returns;
        var benchmark_returns = options.benchmark_returns;
        if( !_.isObject(fund_returns) || !_.isObject(benchmark_returns) ) { return null; }

        return _(this.groupByDateObject(fund_returns, benchmark_returns))
          .values()
          .thru(this.toCalc, this)
          .map(function(fb_array) { // fb_array = [ fund_return, benchmark_return ]
            if( _.isFinite(fb_array[0]) && _.isFinite(fb_array[1]) ) {
              return fb_array[0] - fb_array[1]; // fund_returns - benchmark_returns
            } else {
              return null;
            }
          })
          .reject(_.isNull)
          .thru(function(values) {
            return ss.mean(values) / ss.sampleStandardDeviation(values)
          })
          .thru(function(relative_deviation) { return _.isFinite(relative_deviation) ? relative_deviation : 0; })  // null, undefined, NaN -> 0
          .thru(function(relative_deviation) {
            var proximity = 0.00001;
            if( 0 - proximity <= relative_deviation && relative_deviation <= proximity + 0 ) {
              return 0;
            } else {
              return relative_deviation;
            }
          })  // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)
          .value();
      }
    }
  });
  return TimeSeries;
});
