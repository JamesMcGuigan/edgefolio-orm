/**
 *  This is the base DateBucketValue for the v3 model framework
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *  @class DateBucketValue
 */
angular.module('edgefolio.models').factory('DateBucketValue', function(ApiFieldGenerator) {

  //// TODO:
  // - have prototype.dates()/values() = [].prototype.timeseries = this (for d3)
  // - map simplestatistics to prototype

  var DateBucketValue = new JS.Class("DateBucketValue", {
    display: null,
    moment:  null,
    parent:  null,

    initialize: function(value, key, parent) {
      this.parent = parent || null;

      ApiFieldGenerator.selfCaching(this, "moment", function() {
        return moment(this.date)
      });

      this.date    = key;
      this.display = value;
    },

    /**
     * The original value, incase it is ever mapped to something other than display
     * @returns {null}
     */
    value: function() {
      return this.display;
    },
    /**
     * toString should return a string representation of the original value
     * This is partially for tests, and partially for the view layer
     * @returns {string}
     */
    toString: function() {
      return String(this.display);
    },
    extend: {
      /**
       * Called by class initialization function
       * When class is used as a object literal in DateBucketMapped or TimeSeries, class is reinitalized but not cloned
       * ```this.displayName || name``` prevents name from getting set to DateBucketMapped.mappingKlass
       */
      setName: function(name) {
        //this.last = this; // console.log("DateBucketValue.js:60:setName", "this.displayName, this.last === this", name, !this.last, this.last === this);
        return this.callSuper(this.displayName || name);
      },

      /**
       * Typesafe casting function
       * @param value  {number|DateBucketValue|null}
       * @param key    {string}
       * @param parent {object}
       * @returns      {*}
       */
      init: function(value, key, parent) {
        if( value === null || value === undefined ) {
          return null
        } else if( value && value.klass && value.isA(this) ) {
          return value;
        } else {
          return new this(value, key, parent);
        }
      }
    }
  });
  return DateBucketValue;
});