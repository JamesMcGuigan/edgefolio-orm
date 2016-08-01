/**
 *  This a decorator around $q.defer() that looks and acts like a $q promise
 *
 *  CallbackPromise.prototype = {
 *    klass:      CallbackPromise,
 *    init:       function(previousCallbackPromise) {},
 *
 *    // Instance variables
 *    deferred:   $q.defer(),
 *    status:     "unresolved", // "unresolved" | "success" | "error"
 *    value:      { "success": null, "error": null },
 *    callbacks:  { "success": [],   "error": [] },
 *    $$state:    this.deferred.promise.$$state,
 *
 *    // Class methods
 *    then:          function(asyncFn) {}, // == this.deferred.promise.then(asyncFn)
 *    catch:         function(asyncFn) {}, // == this.deferred.promise.catch(asyncFn)
 *    finally:       function(asyncFn) {}, // == this.deferred.promise.finally(asyncFn)
 *    callback:      function(syncFn)  {}, // synchronous callback after .resolve()
 *    errorCallback: function(syncFn)  {}, // synchronous callback after .reject()
 *    resolve:    function(resolvedValue) {},
 *    reject:     function(resolvedValue) {},
 *
 *    executeCallbacks: function() {},
 *  };
 */
angular.module('edgefolio.models').factory("CallbackPromise", function($q) {
  function CallbackPromise(previousCallbackPromise) {
    this.init(previousCallbackPromise);
  }

  CallbackPromise.prototype = {
    klass: CallbackPromise,

    init: function(previousCallbackPromise) {
      var self      = this;
      this.deferred = $q.defer();
      this.status   = "unresolved"; // "unresolved" | "success" | "error"

      this.value = {
        "success": null,
        "error":   null
      };
      this.callbacks = {
        "success": [],
        "error":   []
      };

      // add .then() .catch() .finally(), $$state
      for( var key in this.deferred.promise ) {
        this[key] = this.deferred.promise[key]; // don't add to __proto__ it creates a shared promise between all instances
      }

      // chain any unresolved .then() blocks to the new promise
      if( previousCallbackPromise && previousCallbackPromise.status === "unresolved" ) {
        this.then(function() {
          previousCallbackPromise.resolve(self);
          return previousCallbackPromise.then(function() {
            return self; // pass instance to the next promise in the chain
          })
        });
      }
    },

    callback: function(callback) {
      if( typeof callback !== "function" ) {
        console.warn("CallbackPromise::callback(): callback not of type function", callback);
        return this;
      }

      this.callbacks["success"].unshift(callback);
      this.executeCallbacks();

      return this;
    },

    errorCallback: function(callback) {
      if( typeof callback !== "function" ) {
        console.warn("CallbackPromise::onError(): callback not of type function", callback);
        return this;
      }

      this.callbacks["error"].unshift(callback);
      this.executeCallbacks();

      return this;
    },

    executeCallbacks: function() {
      if( this.status === "success" || this.status === "error" ) {
        var next_function;
        while( next_function = this.callbacks[this.status].pop() ) {
          next_function(this.value[this.status]);
        }
      }
    },

    resolve: function(resolvedValue) {
      this.status             = "success";
      this.value[this.status] = resolvedValue;
      this.executeCallbacks();
      return this.deferred.resolve(this.value[this.status]);
    },


    reject: function(resolvedValue) {
      this.status             = "error";
      this.value[this.status] = resolvedValue;
      this.executeCallbacks();
      return this.deferred.reject(this.value[this.status]);
    }
  };

  return function() {
    return new CallbackPromise();
  }
});
