angular.module('edgefolio.models').factory('EventModule', function(
  JS, _
) {
  var EventModule = new JS.Module({
    $bindEvents: null, // { "eventName": [{ callback:, context: }] }

    /**
     * Binds a callback function to an event which can be called via $trigger(), context is
     *
     * @param {String}   eventName
     * @param {Function} callback
     * @param {?Object}   context
     */
    $bind: function(eventName, callback, context) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      if( !_.isFunction(callback) ) {
        console.error("EventModule::$bind(eventName, callback)", "callback is not a function: ", eventName, callback);
        return;
      }
      var bindEntry = { callback: callback, context: context || this };
      if( !_.find(this.$bindEvents[eventName], function(loopBindEntry) {
        return bindEntry.callback === loopBindEntry.callback
            && bindEntry.context  === loopBindEntry.context
      })) {
        this.$bindEvents[eventName].push(bindEntry);
      }
    },
    /**
     * Unbinds an eventName. If callback and/or context are passed in, these are used to filter the unbind
     *
     * @param {?String}   eventName
     * @param {?Function} callback
     * @param {?Object}   context
     */
    $unbind: function(eventName, callback, context) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      if( callback || context ) {
        this.$bindEvents[eventName] = _.reject(this.$bindEvents[eventName], function(bindEntry) {
          if( callback && context ) {
            return bindEntry.callback === callback && bindEntry.context === context
          }
          else if( callback && !context ) {
            return bindEntry.callback === callback
          }
          else if( !callback && context ) {
            return bindEntry.context  === context
          }
        });
      } else {
        this.$bindEvents[eventName] = [];
      }
    },
    /**
     * Triggers all previously bound events with the same eventName, passing in any additional arguments to the callbacks
     *
     * @param {String} eventName
     */
    $trigger: function(eventName /* ,arguments */ ) {
      this.$bindEvents            = this.$bindEvents || {};
      this.$bindEvents[eventName] = this.$bindEvents[eventName] || [];

      var restArgs = [].slice.call(arguments, 1); // = _.rest(arguments)
      _.each(this.$bindEvents[eventName], function(bindEntry) {
        bindEntry.callback.apply(bindEntry.context, restArgs);
      });
    }
  });
  return EventModule;
});
