/**
 *  @class UnenumerablePrototype
 */
angular.module('edgefolio.models').factory('UnenumerablePrototype', function(ApiFieldGenerator) {

  var UnenumerablePrototype = new JS.Class("UnenumerablePrototype", {
    /**
     * Initialize needs to be defined as a function on UnenumerablePrototype.prototype for the code below to work
     */
    initialize: function() {
      var self = this;
    },
    extend: {
      /**
       * @jsclass internal class initialization function
       * This ensures that any functions defined on the class prototype do not pollute the enumerable namespace
       */
      resolve: function() {
        this.callSuper();
        ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Make prototype properties UnenumerablePrototype
      },

      /**
       * @jsclass internal method, called on class extend for all functions
       * This ensures that JS.Class keyword injections do not pollute the enumerable namespace
       *
       * JS.Class reads the function as a string and detects if these are there, if so its adds the callSuper() binding
       * This hack triggers callSuper() insertion on every function call, and guarantees that it will never be enumerable
       *
       * Code below has hardcoded the assumption that only the callSuper() keyword is ever used in this class hierarchy
       *   _.pluck(JS.Method._keywords, 'name') == ["callSuper", "blockGiven", "yieldWith"]
       *
       * Attempting to optionally add the wrapper function based on callable.toString() fail tests on deeply nested classes
       *
       * NOTE: ConstantScope is the class to look at for attempting to do code injections via a module
       */
      define: function(name, callable, options) {
        var _callable = function() {
          // The string 'callSuper' needs to appear in the text of the function for this to work
          Object.defineProperty(this, 'callSuper', { enumerable: false, configurable: true, writable: true });
          return callable.apply(this, arguments);
        };
        return this.callSuper(name, _callable, options);
      }
    }

    //// Additional Methods in JS.Class that can potentually be hooked into
    //
    // initialize: function(name, methods, options) {},
    // define: function(name, callable, options) {},
    // include: function(module, options) {},
    // alias: function(aliases) {},
    // resolve: function(host) {},
    // shouldIgnore: function(field, value) { return false; },
    // ancestors: function(list) { return list; },
    // lookup: function(name) { return methods; },
    // includes: function(module) { return false; },
    // instanceMethod: function(name) { return this.lookup(name).pop(); },
    // instanceMethods: function(recursive, list) { return methods; }
    // match: function(object) { return object && object.isA && object.isA(this); },
    // toString: function() { return this.displayName; }
  });

  return UnenumerablePrototype;
});


/**
 * @broken
 * src/enterprise/models/_tests/util/UnenumerableApiBaseClass.spec.broken.js
 * it("UnenumerablePrototype", function() {
 *    var instance = UnenumerableApiBaseClass.load();
 *   expect(_.keys(instance)).to.deep.equal([]);
 * });
 */
angular.module('edgefolio.models').factory('UnenumerableApiBaseClass', function(ApiBaseClass, ApiFieldGenerator) {
  var UnenumerableApiBaseClass = new JS.Class("UnenumerableApiBaseClass", ApiBaseClass, {
    /**
     * Defining initialize() in this specific instance breaks JS.Class
     */
    // initialize: function() {},
    $reload: function() {
      console.error("@broken - UnenumerableApiBaseClass does not make instance variables unenumerable");

      this.callSuper();

      // AssertionError: expected [ '$options', 'id', '$loaded', '$dataVersion', '$data', '$cache', '$fields', '$loadPromise', '$preloadPromise', 'result_ids', 'results', 'result_index' ] to deeply equal []
      var self = this;
      _(this).omit(_.isFunction).keys().sortBy().each(function(key) {
        Object.defineProperty(self, key, { enumerable: false, configurable: true, writable: true });
      });
    },
    extend: {
      resolve: function() {
        this.callSuper();
        ApiFieldGenerator.klass.unenumerableKlassPrototype(this); // Make prototype properties UnenumerablePrototype
      },
      define: function(name, callable, options) {
        var _callable = function() {
          // The string 'callSuper' needs to appear in the text of the function for this to work
          Object.defineProperty(this, 'callSuper', { enumerable: false, configurable: true, writable: true });
          return callable.apply(this, arguments);
        };
        return this.callSuper(name, _callable, options);
      }
    }
  });
  return UnenumerableApiBaseClass;
});