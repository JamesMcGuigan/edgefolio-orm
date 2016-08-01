/**
 *  This is the base DateBucket for the v3 model framework
 *
 *  Assumes:
 *    src/common_components/global/date_toString.js - sets Date.prototype.toString = Date.prototype.toISOString (sortable)
 *
 *  DateBucketCache is kept outside the visible object tree, to avoid Inspectlet and other 3rd party libs from excess processing
 *
 *  NOTE: Strips null tails from both ends of timestamp_indexed_object
 *
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *  @class DateBucket
 */
angular.module('edgefolio.models').factory('DateBucketCache', function() {
  return {
    getKey:        {},
    dateBucket:    {},
    incrementDate: {}
  };
});
angular.module('edgefolio.models').factory('DateBucket', function(
  _, $q, ApiBaseClass, ApiFieldGenerator, UnenumerablePrototype, DateBucketCache, moment
) {

  var DateBucket = new JS.Class("DateBucket", UnenumerablePrototype, {
    initialize: function(timestamp_indexed_object, options) {
      options = _.extend({
        prevalidated: false // @optimization: if true, don't run this.klass.dateBucketObject() on input
      }, options);

      if( options.prevalidated ) {
        this._setAllFromObjectPrevalidated(timestamp_indexed_object);
      } else {
        this._setAllFromObject(timestamp_indexed_object);
      }
    },

    // TimeSeries.latest_date needs to be self-caching to preserve object identity - preventing angular $digest loops
    $initializeObjectProperties: function() {
      ApiFieldGenerator.selfCaching(this, {
        "latest":           this.$latest,
        "latest_date":      this.$latest_date,
        "first":            this.$first,
        "first_date":       this.$first_date,
        "max_timeframe_id": this.$max_timeframe_id
      }, {
        enumerable:   false, // expose in for( key in instance ) loop
        configurable: false  // allow property to be redefined later
      });
    },

    has: function(date) {
      return _.has( this, this.getKey(date) );
    },
    /**
     * Returns this.klass.dateBucket(date).toISOString()
     *
     * @memoized - profiler indicates this is a highly used function, and moment(date).toISOString() is expensive
     * @param   {moment|string} date
     * @returns {String}
     */
    getKey: function(date) {
      var cache     = DateBucketCache['getKey'];
      var cache_key = date instanceof moment ? Number(date) : date;
      if( !cache[cache_key] ) {
        cache[cache_key] = this.klass.dateBucket(date).toISOString(); // .toString() === .toISOString()
      }
      return cache[cache_key];
    },
    get: function(date) {
      var value = this[ this.getKey(date) ];
      return this.klass.isValidValue(value) ? value : null; // // 0 -> 0; null, undefined, NaN, Infinity -> null
    },

    /**
     * DateBucket objects connected to ApiTimeClass instances should not be modified, create new object instead
     * @param date  {string|moment}
     * @param value {number}
     */
    _set: function(date, value) {
      if( this.has(date) ) {
        this[ this.getKey(date) ] = value;
        this.$initializeObjectProperties(date, value);
      } else {
        // Need to ensure new key values are in sorted order
        this[ this.getKey(date) ] = value;
        this._setAllFromObject( this.toObject() );
      }
    },

    /**
     * Resets key/value pairs in DateBucket "this"
     * Rounds and sorts all date keys to endOf(klass.dateBucketSize || "month"), filling in blanks with null
     * If multiple timestamp keys are in the same dateBucket, then latest non-null datestamp value is chosen
     * Results in _.keys(this) being a sorted timestamp list, containing only data from the last call to this._setAllFromObject()
     * @param timestamp_indexed_object {DateBucket}
     */
    _setAllFromObject: function(timestamp_indexed_object) {
      timestamp_indexed_object = this.klass.dateBucketObject(timestamp_indexed_object);
      this._setAllFromObjectPrevalidated(timestamp_indexed_object);
    },
    _setAllFromObjectPrevalidated: function(timestamp_indexed_object) {
      // Remove any old keys
      for( var key in this ) {
        delete this[key];
      }
      // Apply new keys to this
      for( var key in timestamp_indexed_object ) {
        this[key] = timestamp_indexed_object[key];
      }
      this.$initializeObjectProperties();
    },

    /**
     * @returns {array<String>} datestrings currently stored
     */
    keys: function() {
      var keys = [];
      for( var key in this ) {
        keys.push(key)
      }
      return keys;
    },
    /**
     * @returns {array<moment>} datestrings currently stored converted to moment() dates
     */
    dates: function() {
      return this.keys().map(function(key) { return moment(key); });
    },

    /**
     * @returns {array<number>} array of values, stored by default as 1 = 1%
     */
    values: function() {
      var values = [];
      for( var key in this ) {
        values.push(this[key])
      }
      return values;
    },

    size: function() {
      return this.keys().length
    },


    /**
     * @returns {object}
     */
    toObject: function() {
      var object = {};
      for( var key in this ) {
        object[key] = this[key];
      }
      return object; // returns object not TimesSeries
    },

    /**
     * @returns {DateBucket}
     */
    clone: function() {
      return new this.klass( this.toObject() );
    },

    /**
     * @untested
     * Runs _.mapValues() but returning a new DateBucket object
     * @param   {Function} callback
     * @param   {?Object}  context
     * @returns {DateBucket}
     */
    mapValues: function(callback, context) {
      var mapped_data = _.mapValues(this.toObject(), callback, context);
      return this.klass.init(mapped_data);
    },

    $latest: function() {
      var value = _(this.toObject()).omit(_.isNull).values().last();
      return this.klass.isValidValue(value) ? value : null;
    },
    $latest_date: function() {
      var value = _(this.toObject()).omit(_.isNull).keys().last();
      return value && moment(value) || null;
    },
    $first: function() {
      var value = _(this.toObject()).omit(_.isNull).values().first();
      return this.klass.isValidValue(value) ? value : null;
    },
    $first_date: function() {
      var value = _(this.toObject()).omit(_.isNull).keys().first();
      return value && moment(value) || null;
    },
    $max_timeframe_id: function() {
      return moment().diff( this.first_date, 'months' ) || 0;
    },

    /**
     * TODO: remove
     * @returns {string} first datestring in DateBucket range
     */
    $start_datestring: function() {
      return _(this.keys()).first(); // keys are presorted, so sort operation should be O(N)
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range as moment
     */
    $start_date: function() {
      return moment( this.$start_datestring() );
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range
     */
    $end_datestring: function() {
      return _(this.keys()).last(); // keys are presorted, so sort operation should be O(N)
    },
    /**
     * TODO: remove
     * @returns {string} last datestring in DateBucket range as moment
     */
    $end_date: function() {
      return moment( this.$end_datestring() );
    },

    /**
     * @tested
     * Returns a new TimeSeries object limited to the provided date range
     *
     * python: mask_returns_to_period
     * @param start_date {string|moment|array<string|moment>} dates can be passed in as as either arguments or arrays
     * @param end_date   {string|moment|array<string|moment>}
     * @returns {TimeSeries}
     */
    subsetDateRange: function( /* start_date, end_date */ ) {
      var date_range = _(this.klass.argumentsToFlattenedFilteredArray(arguments)).map(String).sortBy().value();
      var start_date = _.first(date_range);
      var end_date   = _.last(date_range);

      return this._subsetDateRange(start_date, end_date);
    },
    _subsetDateRange: function(start_date, end_date) {
      // @optimization, Optimized too many times - ensure start_date, end_date are always of type String
      var timestamp_indexed_object = {};
      var keys = this.keys();

      // this.keys() is presorted - so linear search is fastest
      for( var i=0, n=keys.length; i<n; i++ ) {
        if( keys[i] >= start_date ) { break; }
      }
      for( ; i<n; i++ ) {
        if( keys[i] > end_date ) { break; }
        timestamp_indexed_object[keys[i]] = this[keys[i]]; // if( start_date <= date && date <= end_date )
      }
      return this.klass.init(timestamp_indexed_object, { prevalidated: true });
    },

    /**
     * @untested
     * Returns a subset of the dataset as a new instance, from now to X months ago
     * @param   {Number|Object} months  timeframe_id which equals the number of months previous subset
     * @returns {DateBucket}
     */
    timeframe: function( input ) {
      var months = _.isObject(input) ? Number(input.timeframe_id) : Number(input) || 0;
      if( !_.isFinite(months) || months === 0 ) { return this; } // no-op

      var unit = this.klass.dateBucketSize || 'month';
      return this.subsetDateRange(moment(), moment().add(-months, unit));
    },

    extend: {
      dateBucketSide: 'endOf', // endOf | startOf
      dateBucketSize: 'month', // year | quarter | month | week | day | hour | minute | second | millisecond

      // Class initialization function
      resolve: function() {
        this.dateBucketSize       = moment.normalizeUnits(this.dateBucketSize); // m || months -> month
        this._dateBucketSizeIsDay = _(['day', 'hour', 'minute', 'second', 'millisecond']).includes( this.dateBucketSize );
        this.callSuper();

        // ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Called from UnenumerablePrototype.klass.define()
      },

      /**
       * Creates/clones a new DateBucket object
       * @param timestamp_indexed_object
       * @returns {DateBucket}
       */
      init: function(timestamp_indexed_object, options) {
        return new this(timestamp_indexed_object, options);
      },

      /**
       *
       * @param   {Array|String} options.timeseries_id  argument for Edgefolio.load()
       * @param   {Number}       options.timeframe_id
       * @returns {Promise<TimeSeries|null>}
       */
      loadFromUuid: function(uuid, options) {
        var self = this;
        options = {
          timeframe_id:  options.timeframe_id  || 0
        };
        var timeseries = ApiBaseClass.loadUuid(uuid);

        if( !timeseries || !timeseries.$loadPromise ) {
          return $q.when(null);
        }
        return timeseries.$loadPromise.then(function(timeseries) {
          if( !timeseries.isA(DateBucket) ) {
            timeseries = _.get(timeseries, 'returns_time_series') || timeseries;
          }
          if( !timeseries.isA(DateBucket) && _.get(timeseries, 'base_share_class') ) {
            uuid = _.get(timeseries, 'base_share_class.uuid');
            return self.loadFromUuid(uuid, options); // recurse
          }
          if( !timeseries.isA(DateBucket) ) {
            return null;
          } else {
            return timeseries.timeframe(options.timeframe_id);
          }
        });
      },


      isValidValue: function(value) {
        return _.isFinite(value);
      },

      /**
       * Buckets date and add(1, dateBucketSize)
       * @param date {string|moment}
       * @returns {moment}
       */
      incrementDate: function(date) {
        var cache     = DateBucketCache['incrementDate'];
        var cache_key = date instanceof moment ? Number(date) : date;
        if( !cache[cache_key] ) {
          cache[cache_key] = this.dateBucket( moment(date).add(1, this.dateBucketSize) );
          Object.freeze(cache[cache_key])
        }
        return cache[cache_key]
      },

      /**
       * Returns a bucketed date rounded to the start of the last day in the month
       * or as configured via this.dateBucketSide and this.dateBucketSize
       *
       * @memoized - profiler indicates this is a highly used function, and moment(date).toISOString() is expensive
       * @param date {string|moment}
       * @returns {moment}
       */
      dateBucket: function(date) {
        var cache     = DateBucketCache['dateBucket'];
        var cache_key = date instanceof moment ? Number(date) : date;
        if( !cache[cache_key] ) {
          if( this._dateBucketSizeIsDay ) { // cache lookup in klass.resolve() as this is a looped over function
            cache[cache_key] = moment(date)[this.dateBucketSide](this.dateBucketSize);
          } else {
            cache[cache_key] = moment(date)[this.dateBucketSide](this.dateBucketSize).startOf('day');
          }
          Object.freeze(cache[cache_key])
        }
        return cache[cache_key]
      },

      /**
       * Returns sorted array of all bucketed dates between the first and last dates in the input range
       * @param date_array {array<string|moment>}
       * @returns {array<moment>}
       */
      dateArray: function(date_array) {
        if( !_.isArray(date_array) || date_array.length === 0 ) {
          return [];
        }
        var dates      = _(date_array).filter().sortBy().value();
        var start_date = this.dateBucket(_.first(dates));
        var end_date   = this.dateBucket(_.last(dates));

        // date <= $end_date is broken due to Datejs toISOString() bug
        var output = [];
        for( var date = start_date; date <= end_date; date = this.incrementDate(date) ) {
          output.push(date);
        }
        return output;
      },

      /**
       * Reindexes a timestamp indexed object with this.dateArray() as keys
       * If two dates are in the same bucket, the latest date non-null value will be used
       * Does not modify original object
       * Only excludes null and undefined values
       * @param timestamp_indexed_object {DateBucket}
       * @returns {object}
       */
      dateBucketObject: function(timestamp_indexed_object) {
        var key;
        var date_strings = [];
        for( key in timestamp_indexed_object ) {
          if( !_.isNull(timestamp_indexed_object[key]) && !_.isUndefined(timestamp_indexed_object[key]) ) {
            date_strings.push(key);
          }
        };
        date_strings.sort();

        var date_range = this.dateArray(date_strings);

        var output = {};
        for( var i=0, n=date_range.length; i<n; i++ ) {
          output[date_range[i]] = null;
        }
        for( key in timestamp_indexed_object ) {
          if( timestamp_indexed_object[key] !== null && timestamp_indexed_object[key] !== undefined ) {
            output[this.dateBucket(key)] = timestamp_indexed_object[key];
          }
        }
        return output;
      },

      /**
       * @untested
       * TODO: Optimize
       * Returns a new TimeSeries object limited to the provided date range
       *
       * python: mask_returns_to_period
       * @param {DateBucket} timestamp_indexed_object
       * @param {string|moment|array<string|moment>} start_date   dates can be passed in as as either arguments or arrays
       * @param {string|moment|array<string|moment>} end_date
       * @returns {TimeSeries}
       */
      subsetDateRange: function(timestamp_indexed_object, start_date, end_date) {
        return this.init(timestamp_indexed_object, { prevalidated: true }).subsetDateRange(start_date, end_date);
      },

      /**
       * @untested
       * TODO: Optimize
       * Returns a subset of the dataset for the last X months (or dateBucketSize)
       *
       * @param {DateBucket} timestamp_indexed_object
       * @param months
       * @returns {DateBucket}
       */
      timeframe: function(timestamp_indexed_object, months) {
        return this.init(timestamp_indexed_object, { prevalidated: true }).timeframe(months);
      },


      /**
       * @tested
       */
      toCalc: function(value) {
        // process common cases first
        if( value === null    ) { return null; }
        if( _.isFinite(value) ) { return value === 0 ? 0 : value/100; }
        if( _.isNumber(value) ) { return value || null; } // NaN -> null
        if( _.isArray(value)  ) { return _.map(value, this.toCalc, this); }
        if( _.isObject(value) ) { return _.mapValues(_.clone(value), this.toCalc, this); }
        else                    { return null; }
      },

      /**
       * @tested
       */
      fromCalc: function(value) {
        // process common cases first
        if( value === null    ) { return null; }
        if( _.isFinite(value) ) { return value * 100; }
        if( _.isNumber(value) ) { return value || null; } // NaN -> null
        if( _.isArray(value)  ) { return _.map(value, this.fromCalc, this); }
        if( _.isObject(value) ) { return _.mapValues(_.clone(value), this.fromCalc, this); }
        else                    { return null; }
      },

      toCompounded: function(fund_returns, base_multiplier) {
        var was_array   = _.isArray(fund_returns);
        base_multiplier = base_multiplier || 1000;

        var count = 1;
        var compounded_returns = _(fund_returns)
          .thru(this.toCalc, this)
          .mapValues(function(value) {
            count = count * (1 + (value || 0));
            return count;
          })
          .mapValues(function(value) {
            return value * base_multiplier;
          })
          .value()
        ;

        if( was_array ) {
          compounded_returns = _.values(compounded_returns);
        }
        return compounded_returns;
      },

      /**
       * @tested implicitly
       */
      thruCalcToNumber: function(fund_returns, callback, context) {
        return _(fund_returns)
          .values()
          .reject(_.isNull)
          .thru(this.toCalc, this)    // n = n/100
          .thru(function(values_array) {
            context = context || this;
            return callback.call(context, values_array);
          })
          .thru(function(value) { return _.isFinite(value) ? value : 0; })  // null, undefined, NaN -> 0
          .thru(this.fromCalc, this)  // n = n*100
          .value()
        ;
      },

      /**
       * @tested - implicitly through this.groupByDateObject() and this.subsetDateRange()
       * @optimized "bad value context for arguments value" causing lodash to slow
       *
       * @param  {Array} arguments
       * @return {Array} _(arguments).flatten(true).filter().value();
       */
      argumentsToFlattenedFilteredArray: function(args) {
        var array_of_returns = [];
        if( args && args.length ) {
          for( var i = 0, ni = args.length; i < ni; i++ ) {
            if( _.isArray(args[i]) ) {
              for( var j = 0, nj = args[i].length; j < nj; j++ ) {
                if( _.isArray(args[i][j]) ) {
                  for( var k = 0, nk = args[i][j].length; k < nk; k++ ) {
                    if( !_.isNull(args[i][j][k]) && !_.isUndefined(args[i][j][k]) ) {
                      array_of_returns.push(args[i][j][k]);
                    }
                  }
                } else {
                  if( !_.isNull(args[i][j]) && !_.isUndefined(args[i][j]) ) {
                    array_of_returns.push(args[i][j]);
                  }
                }
              }
            } else {
              if( !_.isNull(args[i]) && !_.isUndefined(args[i]) ) {
                array_of_returns.push(args[i]);
              }
            }
          }
        }
        return array_of_returns;
      },

      /**
       * this.groupByDateObject() without TimeSeries cast
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {*|DateBucket}  { "timestamp": [1,2,3], ... }
       */
      groupByDate: function() {
        return this.init( this.groupByDateObject.apply(this, arguments), { prevalidated: true });
      },

      /**
       * @tested
       * this.groupByDate() but without the TimeSeries cast
       *
       * _(keys).indexBy().mapValues(function(key) {
       *  return _(array_of_returns).pluck(key).map(function(value) { return _.isUndefined(value) ? null : value;  }).value()
       * }).value();
       *
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {object}  { "timestamp": [1,2,3], ... }
       */
      groupByDateObject: function( /* array_of_returns */ ) {
        var array_of_returns = this.argumentsToFlattenedFilteredArray(arguments);
        return this._groupByDateObject(array_of_returns); // @optimization: "bad value context for arguments value"
      },
      _groupByDateObject: function(array_of_returns) {
        var keys = this.groupByDateKeys(array_of_returns);

        var output = {};
        for( var k=0, nk=keys.length; k<nk; k++ ) {
          var key = keys[k];
          var row = []; row.length = array_of_returns.length;
          for( var i=0, ni=array_of_returns.length; i<ni; i++ ) {
            var value = array_of_returns[i][key];
            value = ( typeof value !== 'undefined' ) ? value : null;
            row[i] = value;
          }
          output[key] = row; // output[key][i] = array_of_returns[i][key]
        }
        return output; // @optimized - cast to TimeFrame is expensive in a tight loop
      },
      /**
       * @tested - implicitly by groupByDateObject()
       *
       * Sorted, unique, flattened list of keys in all arguments
       * _(array_of_returns).map(_.keys).flatten().unique().sortBy().value();
       *
       * @param   {Array<DateBucket>} arguments - is flattened and filtered
       * @returns {Array}
       */
      groupByDateKeys: function( /* array_of_returns */ ) {
        var array_of_returns = this.argumentsToFlattenedFilteredArray(arguments);
        return this._groupByDateKeys(array_of_returns); // @optimization: "bad value context for arguments value"
      },
      _groupByDateKeys: function(array_of_returns) {
        var keys = [];
        var keys_seen = {};
        for( var i=0, ni=array_of_returns.length; i<ni; i++ ) {
          for( var key in array_of_returns[i] ) {
            keys_seen[key] || keys.push(key);
            keys_seen[key] = true;
          }
        }
        keys.sort();
        return keys;
      },

      /**
       * @destructive to container object, but not children
       * If options.timeframe_id != 0, then invoke .timeframe() on all other properties of object, if defined
       * @param   {Object}  options
       * @param   {?Number} options.timeframe_id - if defined, subset all TimeSeries inputs to timeframe range
       * @returns {Object}
       */
      invokeTimeframeOptions: function(options) {
        options = _.isObject(options) ? options : {};
        if( options.timeframe_id ) {
          for( var key in options ) {
            if( _.isFunction(_.get(options, [key, 'timeframe'])) ) {
              options[key] = options[key].timeframe(options.timeframe_id);
            }
          }
          delete options.timeframe_id; // @optimization, remove flag incase this function gets called multiple times
        }
        return options;
      }
    }
  });



//  // Loadsh v3 extensions
//  _.each([
//    "chain",
//    //"create",
//    //"defaults",
//    //"defaultsDeep",
//    //"extend", // -> assign
//    "findKey",
//    "findLastKey",
//    "forIn",
//    "forInRight",
//    "forOwn",
//    "forOwnRight",
//    "functions",
//    "get",
//    "has",
//    "invert",
//    "keys",
//    "keysIn",
//    "mapKeys",
//    "mapValues",
//    //"merge",
//    //"methods", // -> functions
//    "omit",
//    "pairs",
//    "pick",
//    "result",
//    "_set",
//    "transform",
//    "values",
//    "valuesIn"
//  ], function(lodashMixin) {
//    DateBucket.prototype[lodashMixin] = function() {
//      var args = [this].concat(arguments);
//      return _[lodashMixin].apply(_, args);
//    };
//  });
//
//  // Mixin simple statistics arrayMethods to lodash
//  _.each([
//    'median', 'standard_deviation', 'sum',
//    'sampleSkewness',
//    'mean', 'min', 'max', 'quantile', 'geometricMean',
//    'harmonicMean', 'root_mean_square'
//  ], function(ssMixin) {
//    DateBucket.prototype[ssMixin] = function() {
//      // TODO: map .toCalc() .toDisplay()
//
//      var args = [_.values(this)].concat(arguments);
//      return ss[ssMixin].apply(ss, args);
//    };
//  });

  return DateBucket;
});
