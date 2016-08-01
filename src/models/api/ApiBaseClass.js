/**
 *  This is the base ApiBaseClass for the v3 model framework
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *
 *  NOTE: All instance methods and parameters should be prefixed with $ to avoid namespace collisions with dictionary $data
 *  TODO: How to implement angular $$hash for $scope updates
 *
 *  Usage:
 *    var Fund =  new JS.Class("this.klass.displayName", ApiBaseClass, { extend: { classMethod: }, instanceMethod: })
 *    var fund = Fund.load({ id: 1 })                         // returns object before load
 *    var fund = Fund.load({ stateParams: { fund_id: 1 }})    // defaults to ui-router $stateParams
 *    Fund.load({ id: 1 }).loadPromise.then(function(fund){}) // async loading
 *    fund.klass.displayName                                  // access displayName from class constructor
 *    fund.klass.url                                          // access class methods or attributes
 */
angular.module('edgefolio.models').factory('ApiBaseClass', function(
  $injector, $q, $http, $cacheFactory,
  Edgefolio, ApiCache, ApiFieldGenerator, CallbackPromise, EventModule
) {
  var anonClassSetNameCounter = 1;
  var ApiBaseClass = new JS.Class("ApiBaseClass", {
    include: EventModule,

    //***** Instance Parameters - initialize in constructor - fields here are defined in .prototype *****//

    uuid:         null,   // {String} 'Fund:1'   input to ApiBaseClass.loadUuid()
    $$hashKey:    null,   // {String} 'Fund:1:0' for Angular ng-repeat and ApiFieldGenerator.memoize()
    $options:     null,   // {Object} original options the instance was intialized with
    $dataVersion: null,   // {Number} internal version number, incremented on setData
    $data:        null,   // {Object} data as provided by the api
    $cache:       null,   // data cache for ApiFieldGenerator
    $fields:      null,   // ApiFieldGenerator: instance.$fields = { generatorName: { field: <Boolean> }}
    $loadPromise: null,   // <CallbackPromise>
    $loaded:      false,  // <Boolean> has $loadPromise been resolved


    //***** Instance Methods *****//

    /**
     *  Loads a new instance, either fetched from cache or newly created and added to cache
     *  ApiBaseClass.load(1) === new ApiBaseClass(1) === ApiBaseClass.cache[1] (if cached)
     *
     *  @param id      {Number|String|Object}  this.$options = this.klass.parseOptions(id, config)
     *  @param config  {?Object}               this.$options = this.klass.parseOptions(id, config)
     *
     *  @param config.id     {Number|String|function} ID to load
     *  @param config.data   {Object}  define new data for instance
     *  @param config.load   {Boolean} request cached http update for instance [default: true if config.data set]
     *  @param config.force  {Boolean} trigger uncached htto update for instance
     *  @param config.loaded {Boolean} trigger resolution of $loadPromise      [default: true if config.data set]
     *  @param config.silent {Boolean} disable console errors and warnings - for unit tests
     *  @constructor
     */
    initialize: function(id, config) {
      if( !config && typeof id === "number" && this.klass.cache[id] ) { return this.klass.cache[id]; } // short circuit simplest case, bypassing parseOptions()

      this.$options = this.klass.parseOptions(id, config);
      this.id       = this.$options.id; // overwritten by $initializeObjectProperties()

      // Check to see if object already exists in cache, and set or return as necessary
      // NOTE: null is a valid cache id, even if this.idParams - this prevents infinite loops when accessed from HTML layer
      if( this.klass.cache[this.id] ) {
        if( this.$options.data ) {
          this.klass.cache[this.id].$setData(this.$options.$data);
        }
        if( this.$options.force ) {
          this.klass.cache[this.id].$reload({
            force: this.$options.force,
            load:  this.$options.force
          });
        }
        return this.klass.cache[this.id];
      } else {
        this.klass.cache[this.id] = this;
      }

      this.$loaded      = !!this.$loaded; // instance paramters declared outside initialize do not seem to show
      this.$dataVersion = this.$dataVersion || 0;
      this.uuid         = [this.klass.displayName, this.id].join(':'); // 'Fund:1:0'
      this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':');
      this.$data        = {};
      this.$cache       = {};
      this.$fields      = {};
      this.$reload(_.extend({ force: false, load: true }, this.$options));
    },

    /**
     *  @untested
     *  Force reloads the object from the API, resetting $loadPromise but preserving any unresolved chains
     *  - Called by initialize with this.$options
     *
     *  $reload() is potentually called as this.klass.cache[this.id].$reload(options) - so don't read this.$options
     *
     *  @param options.data   - define new data for instance
     *  @param options.load   - request cached http update for instance
     *  @param options.force  - trigger uncached htto update for instance
     *  @param options.loaded - trigger resolution of $loadPromise
     *  @returns {CallbackPromise}
     */
    $reload: function(options) {
      options = options || {};
      options = {
        force:   options.force,
        load:    options.load,
        loaded:  options.loaded,
        data:    options.data
      };
      this.$options = _.extend(this.$options, options);

      this.$initializeLoadPromise();
      this.$initializePreloadPromise();

      this.$setData(options.data);
      if( options.load !== false ) { // assume true if undefined
        this.$loadData(options);
      }
      if( options.loaded ) {
        this.$loadPromise.resolve(this); // set this.$loaded = true; and resolve $loadPromise
      }

      return this.$loadPromise; // allow instance.$reload().then()
    },
    $initializeLoadPromise: function() {
      var self = this;
      this.$loadPromise = CallbackPromise(this.$loadPromise || null); // chain any unresolved .then() blocks to the new promise object
      this.$loadPromise.callback(function() {
        self.$loaded = true; // doesn't matter if this gets called multiple times on $reload
      });
    },
    $initializePreloadPromise: function() {
      // Wait for $preloadPromise to be accessed before lazy-loading child data
      this.klass.ApiFieldGenerator.defineGetters(this, {
        $preloadPromise: function() {
          return $q.when(this.$loadPromise)
        }
      })
    },


    /**
     *  Defines the getter/setter mappings for this.data
     *  Gets run on original initialization, and again after this.$setData(),
     *  as this function may depend on the keys in this.data
     *
     *  Extend $initializeObjectProperties with additional Object.defineProperty() specifications
     *  NOTE: remember to also call: this.callSuper()
     */
    $initializeObjectProperties: function() {
      for( var field in this.$data ) {
        this.klass.ApiFieldGenerator['static'](this, field, this.$data);
      }
      this.klass.ApiFieldGenerator.aliasFunction(this, 'url', '$getUrl()');
    },

    //***** API CRUD Methods *****//

    $deleteFromApi: function() {
      var self = this;
      this.$invalidateCache();
      return $http({
        method: "DELETE",
        url:    this.$getUrl()
      }).then(function() {
        self.$trigger('destroy', this); // @unused - TODO: Implement in ApiFieldGenerator
        delete self.klass.cache[self.id];
        return self;
      })
    },

    //***** Utility Methods *****//

    /**
     * @untested
     * Returns the url for the current object
     * @returns {String}
     */
    $getUrl: function() {
      return this.klass.getUrl(this.id);
    },


    //***** Data Loading *****//

    /**
     * @untested
     * Overridable setter function
     * @param data
     */
    $setData: function(data) {
      if( !_.isObject(this.$data) ) {
        this.$data = {};
      }
      if( _.isObject(data) ) {
        // WARNING: this creates a pointer, rather than a clone - _.cloneDeep() is potentially expensive
        this.$dataVersion = this.$dataVersion + 1;
        this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':'); // 'Fund:1:0'
        this.$data        = data;
      }
      this.$initializeObjectProperties();
      this.$trigger('$setData', this)
    },

    /**
     * @untested
     * Calls $fetchData(), $setData(), returns resolved _loadDeferred.promise
     * @returns Promise(response.data || null)
     */
    $loadData: function(options) {
      var self = this;
      return this.$fetchData(options)
        .then(function(responseData) {
          self.$setData(responseData);
          return self.$loadPromise.resolve(self);
        })
        ["catch"](function(response) {
          return self.$loadPromise.reject(response);
        })
    },

    /**
     * @untested
     * Fetches response.data from the api and returns promise with raw data
     * @param options
     * @returns Promise(response || null)
     */
    $fetchData: function(options) {
      var self = this;
      options = _.extend({
        url:    this.$getUrl(),
        silent: false,
        force:  false
      }, this.$options, options);

      if( options.force ) {
        this.$invalidateCache(options.url);
      }
      return $http.get(options.url, { cache: true }).then(function(response) {
        if( !response.data || response.status >= 400 ) {
          options.silent || console.error(self.klass.displayName, '::$fetchData() invalid response: ', options.url, response);
          return $q.reject(response);
        } else {
          return response.data;
        }
      })
    },
    $invalidateCache: function(url) {
      url = url || this.$getUrl();
      var path = url.replace(new RegExp('^https?://[^/]+/'), '/'); // $cacheFactory indexes on url path without domain
      $cacheFactory.get('$http').remove(path);
    },

    toString: function() {
      return this.$$hashKey;
    },
    /**
     * BUGFIX: inspectlet.js: Uncaught TypeError: Converting circular structure to JSON - SPEC: Remove dependency on inspectlet due to legal/privacy issues
     */
    toJSON: function() {
      return JSON.stringify(this.$data);
    },
    /**
     * @return {Object} object litteral
     */
    toObject: function() {
      return _.clone(this);
    },

    //***** Class Methods and Parameters *****//

    extend: {
      // displayName: "",    // Dynamically inserted by JS.Class("this.klass.displayName", ApiBaseClass)
      url:     null,         // application-constants.js - API.HEDGE_FUNDS_DETAILS: '/api/funds/:fund_id/',
      idParam: null,         // fund_id
      cache:   {},
      ApiFieldGenerator: ApiFieldGenerator, // convenience pointer

      defaultOptions: {
        id:          null,  // <int>        explicit id, overriding stateParams
        data:        null,  // <Object>     data to load instance with
        load:        true,  // <Boolean>    explicitly set to false if no data loading is required
        silent:      false  // <Boolean>    disable console warnings
      },

      // Called by class initialization function
      setName: function(name) {
        // Keep this.displayName if set to prevent JS.Class renaming klass to Benchmarks.resultsKlass etc.
        name = this.displayName || name || "AnonClass-" + (anonClassSetNameCounter++);
        return this.callSuper(name);
      },

      // Class initialization function
      resolve: function() {
        this.cache = ApiCache[this.displayName] = ApiCache[this.displayName] || {};

        Edgefolio[this.displayName] = Edgefolio[this.displayName] || this;
        return this.callSuper();
      },

      /**
       * Class method for loading a new instance, either fetched from cache or newly created and added to cache
       * ApiBaseClass.load(1) === new ApiBaseClass(1) === ApiBaseClass.cache[1] (if cached)
       *
       * @param id      {number|string|object}
       * @param config  [optional] {object}
       * @returns {ApiBaseClass}
       */
      load: function(id, config) {
        // short circuit simplest case, bypassing parseOptions() - null is a valid id
        if( !config && !_.isObject(id) && this.cache[id] ) {
          return this.cache[id];
        }

        //this.isValid = this.isValid || this.validateClass(); // only validate on first load
        return new this(id, config); // id singleton pattern moved to instance constructor
      },

      /**
       * @tested
       * @param   {Any}         1, "ApiBaseClass:1", ["ApiBaseClass","1"], ApiBaseClass.load(1), $stateParams, null
       * @returns {String|null} eg 'Fund:1', 'FundGroups:' OR null for invalid input
       */
      toUuid: function(uuid) {
        if( _.isNull(uuid) && _.isUndefined(uuid) ) {
          return null;
        }
        if( _.isArray(uuid) && _.isFinite(Number(uuid[1])) ) {
          return uuid.join(':');
        }
        if( _.isString(uuid) && _.contains(uuid, ':') ) { // already a uuid
          return uuid;
        }
        if( uuid && uuid.uuid ) {
          return uuid.uuid;
        }
        else {
          if( this.idParam ) {
            var options = this.parseOptions(uuid, { silent: true });
            return options.id && [this.displayName, options.id].join(':') || null;
          } else {
            return this.displayName + ':';
          }
        }
      },
      /**
       * @tested
       * _.memoize() required to return same Array object literal (not needed for strings)
       * Prevents: angular exception: 10 $digest() iterations reached. Aborting!
       *
       * @param   {Array<Any>}  1, "ApiBaseClass:1", ["ApiBaseClass","1"], ApiBaseClass.load(1), $stateParams, null
       * @returns {Array}       filtered - ['Fund:1', 'FundGroups:']
       */
      toUuids: ApiFieldGenerator.memoize(function(ids) {
        var output   = _.map(ids, this.toUuid, this);
        this.cache.toUuids         = this.cache.toUuids || {};
        this.cache.toUuids[output] = this.cache.toUuids[output] || output; // return same object literal for view layer
        return this.cache.toUuids[output];
      }),


      /**
       * @untested
       * Loads an ApiBaseClass instance from String
       * @param   {String|Array|Number}  uuid          "Fund:1" || ["Fund", "1"] || 1
       * @param   {String|Object}        defaultClass  "Fund" || Fund
       * @returns {ApiBaseClass}
       */
      loadUuid: function(uuid, defaultClass) {
        var id, klass;

        // If a instance has been passed in directly, just return it
        if( uuid && uuid.klass ) {
          return uuid;
        }
        defaultClass = defaultClass || this; // For subclasses

        uuid = _.isArray(uuid) ? uuid : String(uuid).split(':');
        if( !_.isNaN(Number(uuid[0])) ) {
          klass = defaultClass;
          id    = Number(uuid[0]);
        } else {
          klass = uuid[0];
          id    = Number(uuid[1]);
        }
        if( !id ) {
          return null;
        }
        if( _.isString(klass) ) {
          klass = ApiFieldGenerator._getKlass(klass);
        }

        if( klass && klass.load ) {
          if( !klass.idParam ) {
            return klass.load(null);
          } else {
            return id && klass.load(id) || null
          }
        } else {
          // Only console.error if klass is not defined
          console.error("ApiBaseClass.loadUuid(", uuid, defaultClass, ") - unable to parse options");
          return null;
        }
      },

      /**
       *  Parse (id, config) in an implicit and intuitive way
       *  Examples:
       *    ApiBaseClass.load() - implicit via $stateParams
       *    ApiBaseClass.load(1)
       *    ApiBaseClass.load("1")
       *    ApiBaseClass.load({ id: 1 })
       *    ApiBaseClass.load({ fund_id: 1 })
       *    ApiBaseClass.load({ stateParams: { fund_id: 1 }})
       *    ApiBaseClass.load(1, { silent: true })
       *    ApiBaseClass.load({ id: 1 }, { silent: true })
       *    ApiBaseClass.load({ fund_id: 1 }, { silent: true })
       *
       *  @param id      {number|string|object}
       *  @param config  [optional] {object}
       *  @returns       {object}
       */
      parseOptions: function(id, config) {
        config = config || {};
        var options = _.extend({}, this.defaultOptions, {
          // config.load and config.loaded can still be manually overridden
          load:    !(_.get(id, 'data') || _.get(config, 'data')),
          loaded: !!(_.get(id, 'data') || _.get(config, 'data'))
        }, config);

        if( typeof id === "number" || typeof id == "string" ) {
          options.id = id;
        }
        else if( typeof id === "object" ) {
          options = _.extend(options, id);
        }

        options.id = options.id
                  || this.idParam && options[this.idParam]
                  || options.stateParams && options.stateParams[this.idParam]
                  || null;

        if( options.id instanceof Function ) {
          options.id = options.id.call(this);
        }
        if( typeof options.id === "string" && options.id.match(/^\d+$/) ) {
          options.id = Number(options.id);
        }
        options[this.idParam] = options.id || null;

        //// TODO: Commented out for production deployment - trace back null calls
        //if( this.idParam && !options.id ) {
        //  options.silent || console.error(this.displayName, '::load() - unable to parse id: ', id, config);
        //}

        delete options.stateParams;
        return options;
      },

      validateClass: function() {
        var isValid = true;

        if( typeof this.url         !== 'string' ) { console.warn(this.displayName, '::load() - invalid this.url: ',     this); isValid = false; }
        if( typeof this.idParam     !== 'string' ) { console.warn(this.displayName, '::load() - invalid this.idParam: ', this); isValid = false; }

        return isValid;
      },

      /**
       * @untested
       * @returns {string}
       */
      getUrl: function(id, config) {
        var options = this.parseOptions(id, config);
        var url = String(this.url || '');
        if( this.idParam && options.id ) {
          url = url.replace(new RegExp(':'+this.idParam, 'g'), options.id);
        }
        return url;
      },

      /**
       * @untested
       * TODO: should really be a class property
       * @returns {string}
       */
      getIndexUrl: function() {
        return String(this.url || '').replace(new RegExp(':'+this.idParam+'/*', 'g'), '');
      }
    }
  });

  return ApiBaseClass;
});
