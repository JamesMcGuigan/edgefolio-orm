/**
 *  Generator for Object.defineProperty()
 *
 *  Performance Implications of Object.defineProperty(): https://www.nczonline.net/blog/2015/11/performance-implication-object-defineproperty/
 */
angular.module('edgefolio.models').factory('ApiFieldGenerator', function($injector) {
  var AFG, ApiFieldGenerator;
  AFG = ApiFieldGenerator = {
    klass: {
      unenumerableKlassPrototype: function(klass) {
        // for( key in Klass() should not list prototype
        klass = ApiFieldGenerator._getKlass(klass);

        // using `for ver in object` rather than _.keys() as this also matches .constructor
        for( var key in klass.prototype ) {
          Object.defineProperty(klass.prototype, key, {
            configurable: true,
            writable:     true,
            enumerable:   false,
            value:        klass.prototype[key]
          });
        }
        return klass;
      }
    },

    _call: function(context, functionOrValue, value) {
      if( functionOrValue instanceof Function ) {
        return functionOrValue.call(context, value);
      } else {
        return (functionOrValue !== undefined) ? functionOrValue : null;
      }
    },

    _getKlass: function(klass) {
      // workaround for circular dependency injection
      if( typeof klass === "string" ) {
        try {
          klass = $injector.get(klass);
        } catch(e) {
          console.error("ApiFieldGenerator", "$injector.get(", klass, ") failed");
          return null;
        }
      }
      return klass;
    },

    _getId: function(value) {
      if( typeof value === "number" || typeof value === "string" ) {
        return value;
      }
      return value && value.id || null;
    },

    /**
     * Converts field argument into a standardized array structure
     * Lodash _.get() and _.set() execute faster when field is passed in as an pre-parsed array
     * Examples:
     *  'a'             -> ['a']
     *  'a.b.c'         -> ['a','b','c']
     *  ['a','b','c']   -> ['a','b','c']
     *  [['a','b','c']] -> ['a','b','c']
     *
     * @param   {string|Array<string>} field
     * @returns {Array<string>}
     */
    _convertSelectorToArray: function(field) {
      return _.isArray(field) ? _.flatten(field) : String(field).split('.');
      // return _([field]).flatten().map(function(string) { return string.split('.') }).flatten().value(); // ['a', 'b.c'] is not syntax supported by lodash
    },

    /**
     * @untested
     * @param func
     * @returns {recur}
     */
    memoize: function(func) {
      var cache = {};
      var memoized = function() {
        var cacheArgs = [this].concat(_.values(arguments));
        var cacheKey  = JSON.stringify(_.map(cacheArgs, AFG._memoizeCacheKey, AFG));
        if( typeof cache[cacheKey] === 'undefined' ) {
          cache[cacheKey] = func.apply(this, arguments);
        }
        return cache[cacheKey];
      };
      memoized.cache = cache;
      return memoized;
    },
    _memoizeCacheKey: function(item) {
      if( _.isArray(item)  ) { return _.map(item, AFG._memoizeCacheKey, AFG); }
      if( _.isNumber(item) ) { return item; }
      if( _.isString(item) ) { return item; }
      if( _.isObject(item) ) {
        if( item.$$hashkey   ) { return item.$$hashkey;   }
        if( item.displayName ) { return item.displayName; }
        if( item.klass       ) { return String(item);     }
      }
      return item;
    },

    /**
     * Wrapper around Object.defineProperty(instance, field, descriptor)
     * - Prevents redeclaration of fields by duplicate invocations
     * - sets: instance.$fields[options.generator][field] = true
     *
     * @param instance    {object} passed to Object.defineProperty()
     * @param field       {string} passed to Object.defineProperty()
     * @param descriptor  {object} passed to Object.defineProperty()
     * @param options     {object}
     * @param options.generator {string}  index key used in: instance.$fields[options.generator]
     * @param options.priority  {boolean} overwrite defineProperty if undefined or other generator has previously defined it
     *                                    (does not overwrite defineProperty for same [options.generator][field] pair)
     *                                    set { priority: true } for generators that directly access instance.$data
     * @param options.overwrite {boolean} force overwrite defineProperty, even if previously defined by same generator
     */
    defineProperty: function(instance, field, descriptor, options) {
      if( typeof options === "string" ) { options = { generator: options }; }
      options = _.extend({
        generator: "",
        priority:  true,
        overwrite: false
      }, options);

      // instance.$fields = { options.generator: { field: <Boolean> }}
      if( instance && instance.$fields && options.generator ) {

        // Don't redefine defineProperty if explicitly overridden
        if(  options.overwrite
         ||  options.priority && _.get(instance.$fields, [options.generator, field]) !== true
         || !options.priority && _.get(instance.$fields, [options.generator, field]) === undefined
        ) {
          ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);

          // Set all other generator references to false
          for( var generatorKey in instance.$fields ) {
            if( instance.$fields[generatorKey][field] === true ) {
              instance.$fields[generatorKey][field] = false;
            }
          }
          _.set(instance.$fields, _.flatten([options.generator, field]), true);
        }
      } else {
        ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);
      }
    },
    _defineDeepProperty: function(instance, field, descriptor, options) {
      descriptor = _.extend({
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true   // allow property to be redefined later
      }, descriptor);

      // If field is a deep selector, then build a data structure and repoint instance here
      var field_array_parent = AFG._convertSelectorToArray(field);
      var child_field = field_array_parent.pop(); // remove last element
      var parent_instance = instance;
      if( field_array_parent.length ) {
        if( !_.isObject(_.get(instance, field_array_parent)) ) {
          _.set(instance, field_array_parent, {});
        }
        parent_instance = _.get(instance, field_array_parent);
      }
      Object.defineProperty(parent_instance, child_field, descriptor);
    },
    _defineDeepProperties: function(instance, descriptorHash, options) {
      _.forIn(descriptorHash, function(descriptor, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, descriptor, options);
      });
    },


    /**
     * @untested
     * Maps: defines property as function getter, with a wrapper that overwrites the value with the generated output
     * Cache can be invalidated by reinvoking the selfCaching function
     *
     * @param {object}        instance    JS.Class::this
     * @param {string|object} methodHash  fieldName string or { fieldName: callback } methodHash
     * @param {?function}     callback    used if methodHash is a string
     * @param {?object}       descriptor  { enumerable: true, configurable: true }
     */
    defineGetters: function(instance, methodHash, _callback, descriptor) {
      if( _.isString(methodHash) ) {
        methodHash = _.set({}, methodHash, _callback);
      }
      if( !_.isFunction(_callback) && _.isObject(_callback) ) {
        descriptor = _callback;
        _callback = null
      }
      descriptor = _.extend({
        enumerable:   true // expose in for( key in instance ) loop
      }, descriptor);

      _.forIn(methodHash, function(callback, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, _.extend({}, descriptor, {
          configurable: true, // allow property to be redefined later
          get: function() {
            var output = null;
            if( _.isFunction(callback) ) {
              return callback.call(this);
            }
            return output
          }
        }));
      })
    },

    /**
     * Maps: defines property as function getter, with a wrapper that overwrites the value with the generated output
     * Cache can be invalidated by reinvoking the selfCaching function
     *
     * @param {object}        instance    JS.Class::this
     * @param {string|object} methodHash  fieldName string or { fieldName: callback } methodHash
     * @param {?function}     callback    used if methodHash is a string
     * @param {?object}       descriptor  { enumerable: true, configurable: true }
     */
    selfCaching: function(instance, methodHash, _callback, descriptor) {
      if( _.isString(methodHash) ) {
        methodHash = _.set({}, methodHash, _callback);
      }
      if( !_.isFunction(_callback) && _.isObject(_callback) ) {
        descriptor = _callback;
        _callback = null
      }
      descriptor = _.extend({
        enumerable:   true // expose in for( key in instance ) loop
      }, descriptor);

      _.forIn(methodHash, function(callback, field) {
        ApiFieldGenerator._defineDeepProperty(instance, field, _.extend({}, descriptor, {
          configurable: true, // allow property to be redefined later
          get: function() {
            var output = null;
            if( _.isFunction(callback) ) {
              output = callback.call(this);

              if( output !== null ) {
                // This caches the result as an object literal
                // descriptor must be extended to ensure { enumerable: false } is additionally passed in
                ApiFieldGenerator._defineDeepProperty(this, field, {
                  configurable: true, // allow property to be redefined later
                  enumerable:   descriptor.enumerable,
                  value:        output
                });
              }
            }
            return output
          }
        }));
      })
    },


    /**
     *  Maps: instance[field] -> instance.$data[field]
     *
     *  NOTE: Object.defineProperty does introduce a 20x performance hit on read/write operations
     *        but speed should is still be acceptable (500 nanoseconds vs 25 nanoseconds)
     *        https://jsperf.com/property-access-with-defineproperty/3
     *
     * @param instance {object} ApiBaseClass::this
     * @param field    {string} name of field to define
     * @param data     {object} [optional | default: instance.$data] data object map
     */
    'static': function(instance, field, data) {
      data = data || instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return data[field];  },
        set: function(value) { data[field] = value; }
      }, { generator: 'static', priority: false })
    },

    /**
     * Maps: instance[alias] -> instance[field]
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {string|Array<string>} field       deep selector for instance field to access
     */
    alias: function(instance, alias, field) {
      // If alias is passed in as a deep selector, then build any necessary subtree
      field = AFG._convertSelectorToArray(field); // Lodash optimization
      ApiFieldGenerator.defineProperty(instance, alias, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return _.get(instance, field); }, // context: this === instance
        set: function(value) { _.set(instance, field, value); }  // context: this === instance
      }, { generator: 'alias', priority: false })
    },

    /**
     * Maps: instance[alias] -> instance[field].call(instance)
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {string|Array<string>} field       deep selector for instance field to access
     * @param {string|Object}        context     Object || _.get(instance,"context") || instance - use string for lazy context initialization
     */
    aliasFunction: function(instance, alias, field, context) {
      field = AFG._convertSelectorToArray(field); // Lodash optimization
      var field_string = field.join('.');

      if( field_string.match(/^[^()]+\(\)$/) ) { // a.b.c() - only last item in chain is a function
        field = AFG._convertSelectorToArray(field_string.replace('()',''));

        // No function syntax available in the alias chain as context is lazy loaded
        ApiFieldGenerator.defineProperty(instance, alias, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function() {
            context  = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance
            var func = _.get(instance, field);
            return _.isFunction(func) ? func.call(context) : null;
          }
        }, { generator: 'aliasFunction', priority: false })
      } else {
        // No function syntax available in the alias chain as context is lazy loaded
        ApiFieldGenerator.defineProperty(instance, alias, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function() {
            context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance
            return AFG._resolveFunctionChain(instance, field, context);
          }
        }, { generator: 'aliasFunction', priority: false })
      }
    },
    _resolveFunctionChain: function(instance, field, context) {
      context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context, unmatched string defaults to original_instance

      var original = {
        field:    field,
        context:  context,
        instance: instance
      };

      var field_array = AFG._convertSelectorToArray(field); // Lodash optimization
      var output = instance;
      try {
        for( var i=0, n=field_array.length; i<n; i++ ) {
          var child_field = field_array[i];

          var field_is_function = false;
          if( _.endsWith(child_field, '()') ) {
            child_field       = child_field.replace('()', '');
            field_is_function = true;
          }


          if( output !== null && output !== undefined ) {
            output = output[child_field];
          } else {
            console.error("ApiFieldGenerator::_resolveFunctionChain", "unable to resolve chain", field_array.join('.'), 'at', child_field, original);
          }

          // No context available during climb through field_array
          if( field_is_function ) { // Attempt to call using
            if( output && _.isFunction(output) ) {
              output = output.call(context);
            } else {
              console.error("ApiFieldGenerator::_resolveFunctionChain", child_field + "() is not a function", output, 'for', field_array.join('.'), output, original);
              return null;
            }
          }
        }
      } catch(exception) {
        console.error("ApiFieldGenerator::_resolveFunctionChain", "unable to resolve chain", field_array.join('.'), 'at', child_field, output, original, exception);
        return null;
      }
      return output;
    },

//     aliasFunction: function(instance, alias, field, context) {
//       ApiFieldGenerator.defineProperty(instance, alias, {
//         enumerable:   true,  // expose in for( key in this ) loop
//         configurable: true,  // allow property to be redefined later
//         get: function() {
//           context = (_.isString(context) ? _.get(instance, context) : context) || instance; // lazy load context
//           var func = _.get(instance, field);
//           return _.isFunction(func) ? func.call(context) : null
//         }
//       }, { generator: 'alias', priority: false })
//     },

    /**
     * Maps: instance[alias] -> _.pick(instance, fields)
     * @param {Object}               instance    ApiBaseClass::this
     * @param {string|Array<string>} alias       deep selector for alias location
     * @param {Array<string>}        fields      deep selector for instance fields to use as alias properties
     */
    objectAlias: function(instance, alias, fields) {
      ApiFieldGenerator.defineProperty(instance, alias, {
        value: {}
      }, { generator: 'objectAlias', priority: false });

      _.each(fields, function(field) {
        var field_array = AFG._convertSelectorToArray(field); // Lodash optimization
        var last_field  = _.last(field_array);
        var object      = _.get(instance, alias);
        ApiFieldGenerator._defineDeepProperty(object, last_field, {
          enumerable:   true,  // expose in for( key in this ) loop
          configurable: true,  // allow property to be redefined later
          get: function()      { return _.get(instance, field_array); }, // context: this === instance
          set: function(value) { _.set(instance, field_array, value); }  // context: this === instance
        })
      })
    },

    /**
     * Maps: instance[field] -> instance.$data[field].unCamelCase()
     */
    unCamelCase: function(instance, field) {
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return String(data[field] || '').replace(/([a-z])([A-Z])/g, '$1 $2');
        },
        set: function(value) {
          data[field] = String(value  || '').replace(/\s+/g, '') || null;
        }
      }, { generator: 'unCamelCase', priority: true });
    },

    /**
     * Maps: instance[field] -> _(instance).pick(fields).values().filter().join(seperator || ' ')
     */
    join: function(instance, field, fields, seperator) {
      var data = instance.$data;
      seperator = seperator || ' ';

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return _(instance).pick(fields).values().filter().join(seperator || ' ');
        }
      }, { generator: 'join', priority: false });
    },

    /**
     * Maps: instance[alias] -> lookup[instance[field]]
     */
    lookupAlias: function(instance, alias, field, lookup) {
      lookup = lookup || {};

      ApiFieldGenerator.defineProperty(instance, alias, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return lookup[instance[field]] || null;
        },
        set: function(value) {
          // _.findKey(lookup, _.matches(value)); doesn't seem to work for single valued hashes
          for( var key in lookup ) {
            if( lookup[key] == value ) {
              instance[field] = key;
              return;
            }
          }
          instance[field] = null;
        }
      }, { generator: 'lookup', priority: false });
    },

    /**
     * @untested
     * Maps: instance[alias] -> lookup[instance.$data[field]]
     */
    lookupOverwrite: function(instance, field, lookup) {
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          return lookup[data[field]] || null;
        },
        set: function(value) {
          // _.findKey(lookup, _.matches(value)); doesn't seem to work for single valued hashes
          for( var key in lookup ) {
            if( lookup[key] == value ) {
              data[field] = key;
              return;
            }
          }
          instance[field] = null;
        }
      }, { generator: 'lookup', priority: true });
    },

    /**
     * Wraps a this.$data item with a class constructor but storing itself in instance.$cache
     * - class can have any structure, but write operations do not propagate to instance.$data
     *
     * @param {object} instance
     * @param {string} field
     * @param {object} klass
     */
    wrapClassReadOnly: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);
      var data = instance.$data;
      var cache = instance.$cache;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if( !cache[field] ) {
            cache[field] = new klass(data[field]);
          }
          return cache[field];
        },
        set: function(value) {
          if( value instanceof klass ) {
            cache[field] = value;
          } else {
            cache[field] = new klass(value);
          }
        }
      }, { wrapClass: 'wrapClassReadOnly', priority: true });
    },

    /**
     * Wraps a this.$data item with a class constructor overwriting the value in instance.$data
     * - this assumes the class has the appearance of flat json object via ApiFieldGenerator.unenumerableKlassPrototype
     *
     * @param {object} instance
     * @param {string} field
     * @param {object} klass
     */
    wrapClassOverwrite: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);
      var data = instance.$data;

      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if(!( data[field] instanceof klass )) {
            data[field] = new klass(data[field]);
          }
          return data[field];
        },
        set: function(value) {
          if( value instanceof klass ) {
            data[field] = value;
          } else {
            data[field] = new klass(value);
          }
        }
      }, { wrapClass: 'wrapClassReadOnly', priority: true });
    },

    /**
     * Creates a single valued lazy load field
     *
     * Example:
     *   ApiFieldGenerator.lazyLoadId:(this, "fund", "Fund") {
     *   - maps: this["fund_id"] -> this.$data["fund"]
     *   - maps: this["fund"]    -> Fund.load({ id: this["fund_id"], options })
     *
     * @param instance  {object}          "this" within context of ApiBaseClass instance
     * @param field     {String}          name of the api field within this.$data
     * @param klass     {ApiBaseClass|String} klass to initialize, can be passed in as a string to avoid circular dependency injection
     */
    lazyLoadId: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);

      var id_field   = field + '_id';
      var uuid_field = field + '_uuid';
      var cache = instance.$cache;

      // Map this.field_id -> this.$data.field
      ApiFieldGenerator.defineProperty(instance, id_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return this.$data[field] || null;  },
        set: function(value) { this.$data[field] = value; }
      }, { generator: 'lazyLoadId', priority: true });

      ApiFieldGenerator.defineProperty(instance, uuid_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return _.get(this[field], 'uuid') || null;  }
      }, { generator: 'lazyLoadId', priority: true });

      // Map: this.field -> klass.load({ id: this.field_id })
      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          if( !this[id_field] ) {
            cache[field] = null
          }
          else if( !cache[field] || cache[field].id != this[id_field] ) {
            cache[field] = klass.load(this[id_field]);
          }
          return cache[field] || null;
        },
        set: function(value) {
          this[id_field] = ApiFieldGenerator._getId(value);
        }
      }, { generator: 'lazyLoadId', priority: true });


      // Handle pre-injected data structures
      if( instance[id_field] && typeof instance[id_field] === "object" && instance[id_field].id ) {
        var preloadedData = instance[id_field];

        // instance[field] setter should automatically update instance[id_field] value to Number(id) - after klass.load() chain
        instance[field] = klass.load({
          id:     preloadedData.id,
          data:   preloadedData,
          load:   false,
          loaded: true
        });
      }


      ////***** Previous abstracted implementation *****//
      //
      //this.lazyLoadField(instance, field, klass, options,
      //  instance.$cache,
      //  {
      //    id:  function()      { return this[id_field]; },                      // context: this == instance
      //    set: function(value) { this[id_field] = value && value.id || null; }, // context: this == instance
      //    cache_key: field
      //  }
      //);
      //instance[id_field] = instance[id_field] || null; // prefer null over undefined
    },

    //
    /**
     *  SPEC: Current view model is assumed to be read only, thus adding, removing or editing ids is not currently supported
     *
     *  instance.$data.funds:
     *   - instance.fund_ids   = [2,4,6]
     *   - instance.funds      = [Fund.load(2), Fund.load(4), Fund.load(6)]
     *   - instance.fund_index = {2: Fund.load(2), 4: Fund.load(4), 6: Fund.load(6) }
     */
    lazyLoadIdArray: function(instance, field, klass) {
      klass = ApiFieldGenerator._getKlass(klass);

      var self  = this;
      var cache = instance.$cache;

      // id_field: funds -> fund_ids
      // id_field: share_classes -> share_class_ids
      // id_field: employees -> employee_ids
      var id_field = String(field).match(/ees$/) ? String(field).replace(/s$/,  '') + '_ids'
                                                 : String(field).replace(/e?s$/,'') + '_ids';

      var uuid_field  = String(id_field).replace(/_ids$/, '_uuids');
      var index_field = String(id_field).replace(/_ids$/, '_index');


      // Map <Array> this.field_ids -> <Array> this.$data.field
      ApiFieldGenerator.defineProperty(instance, id_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function()      { return this.$data[field];  }, // context: this === instance
        set: function(value) { this.$data[field] = value; }  // context: this === instance
      }, { generator: 'lazyLoadIdArray', priority: true });
      instance[id_field] = instance[id_field] || []; // initialize if null

      // Map <Array> this.field_ids -> <Array> this.$data.field
      ApiFieldGenerator.selfCaching(instance, uuid_field, function() {
        return _.pluck(this[field], 'uuid'); // context: this === instance
      }, { generator: 'lazyLoadIdArray', priority: true });

      // Map <Array> this[field] -> <Array> this[id_field].map(klass.load)
      ApiFieldGenerator.defineProperty(instance, field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          // context: this === instance
          var array_cache_key = [ field, '[', String(instance[id_field]), ']'].join('');
          if( !cache[array_cache_key] ) { // || cache[array_cache_key].length !== instance[id_field].length ) {
            cache[array_cache_key] = _.map(instance[id_field], function(item) {
              var id = Number(item && item.id || item);
              return id && klass.load(id) || null;
            });
          }
          return cache[array_cache_key];
        },
        set: function(value) {
          // context: this === instance
          instance[id_field] = _(value).map(ApiFieldGenerator._getId).filter().value();
        }
      }, { generator: 'lazyLoadIdArray', priority: true });

      // Map <Object> instance[index_field] -> <Object> cache[field]
      ApiFieldGenerator.defineProperty(instance, index_field, {
        enumerable:   true,  // expose in for( key in this ) loop
        configurable: true,  // allow property to be redefined later
        get: function() {
          // context: this === instance
          // dynamically recreate instance[index_field] if instance[id_field] changes
          var hash_cache_key = [ field, '<', String(instance[id_field]), '>'].join('');
          if( !cache[hash_cache_key] ) { // || cache[array_cache_key].length !== instance[id_field].length ) {
            cache[hash_cache_key] = {};

            _.each(instance[id_field], function(item) {
              var id = (item && typeof item === "object") ? item.id : Number(item) || null; // may be either an preloaded object or numeric id

              // TODO: Figure out a mechanism for watching destroy events on child instances
              // Object.defineProperty() and not ApiFieldGenerator.defineProperty() as not applying directly to instance
              Object.defineProperty(cache[hash_cache_key], id, {
                enumerable:   true,  // expose in for( key in this ) loop
                configurable: true,  // allow property to be redefined later
                get: function()      { return klass.cache[id] || klass.load(id) || null;  }, // context: this === instance
                set: function(value) {
                  var new_id = ApiFieldGenerator._getId(value);
                  if( id && new_id && id != new_id && instance[id_field].indexOf(id) !== -1 ) {
                    instance[id_field].splice(instance[id_field].indexOf(id),1, new_id);
                  }
                }
              });
            });
          }
          return cache[hash_cache_key];
        },
        set: function(value) {
          // context: this === instance
          instance[id_field] = _(value).map(ApiFieldGenerator._getId).filter().value();
        }
      }, 'lazyLoadIdArray');

      // TODO: Figure out a mechanism for watching destroy events on child instances
      // Handle pre-injected data structures
      _.each(instance[id_field], function(preloadedData, index) {
        if( typeof preloadedData === "object" ) {
          var id = Number(preloadedData.id);
          if( id ) {
            klass.load({
              id:     id,
              data:   preloadedData,
              load:   false,
              loaded: true
            });
          }

          // preloadedData may be multiply nested, don't modify until klass.load() chain is fully loaded
          // NOTE: need to manually set id for lazyLoadIdArray, but not lazyLoadId
          instance[id_field][index] = id;
        }
      });
    }


//    /**
//     * Fully abstracted method for defining a lazyLoad field without corresponding id_field
//     *
//     * NOTE: Attempting to define lazyLoadField({ instance:, field:, klass:, options:, cache:, callbacks: })
//     *       resulted in getting shared pointers to the cache object
//     *
//     * @param instance  {object}          "this" within context of ApiBaseClass instance
//     * @param field     {String}          name of the api field within this.$data
//     * @param klass     {ApiBaseClass|String} klass to initialize, can be passed in as a string to avoid circular dependency injection
//     * @param options   {object}          [optional] additional options to pass into klass constructor
//     * @param cache     {object}          defaults to instance.$cache
//     * @param callbacks {object[function|value]} functions are called in the context of "this" else return value
//     * @param callbacks.id                function(set_value) - value passed in on set, null on get
//     * @param callbacks.set               function(set_value) - closure for additional set logic
//     * @param callbacks.cache_key         function(id)        - used by: _.get(cache, cache_key) and _.set(cache, cache_key, set_value)
//     * @private
//     * @unused
//     */
//    lazyLoadField: function(instance, field, klass, options, cache, callbacks) {
//      options   = _.extend({}, options);
//      cache     = cache || instance.$cache;
//      callbacks = _.extend({
//        //// Reference implementations subject to change, please explicitly define
//        id:        function(set_value) { return set_value && set_value.id || instance.$data[field] || null; },
//        set:       function(set_value) { return instance.$data[field] = ApiFieldGenerator._getId(set_value) || null; },
//        cache_key: function(id)        { return instance[field]; }
//      }, callbacks);
//
//      var call = function(functionOrValue, value) {
//        if( functionOrValue instanceof Function ) {
//          return functionOrValue.call(instance, value);
//        } else {
//          return functionOrValue || null;
//        }
//      };
//
//      // Map: instance[field] -> klass.load({ id: callbacks.id })
//      ApiFieldGenerator.defineProperty(instance, field, {
//        enumerable:   true,  // expose in for( key in this ) loop
//        configurable: true,  // allow property to be redefined later
//        get: function() {
//          options.id    = call(callbacks.id);
//          var cache_key = call(callbacks.cache_key, options.id);
//
//          if( !_.get(cache, cache_key) && options.id ) {
//            _.set(cache, cache_key, klass.load(options));
//          }
//          return _.get(cache, cache_key) || null;
//        },
//        set: function(set_value) {
//          if( set_value && set_value.klass !== klass ) { console.warn("ApiFieldGenerator.lazyLoadField::set(<", _.get(set_value, 'klass.displayName'), ">) - not of klass: <", _.get(klass, 'klass.displayName'), ">"); } // null is a valid parameter
//
//          var cache_key = call(callbacks.cache_key, set_value.id);
//          _.set(cache, cache_key, set_value || null);
//          call(callbacks.set, set_value);
//        }
//      });
//    }

  };
  return ApiFieldGenerator;
});
