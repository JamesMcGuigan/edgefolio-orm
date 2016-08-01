/**
 *  @class TimeSeriesValue
 */
angular.module('edgefolio.models').factory('TimeSeriesValue', function(ApiFieldGenerator, DateBucketValue) {

  //// TODO:
  // - have prototype.dates()/values() = [].prototype.timeseries = this (for d3)
  // - map simplestatistics to prototype

  var TimeSeriesValue = new JS.Class("TimeSeriesValue", DateBucketValue, {
    calc:    null,
    display: null,
    moment:  null,
    parent:  null,
    roundTo: 5,

    initialize: function(value, key, parent) {
      // Optimization: V8 can't optimise code containing Object.defineProperty, plus in involves a function call
      //               so store this.calc as object literal value, and define getters and setters for this.display for the view
      //               this also solves the floating point rounding issue after calculations
      Object.defineProperties(this, {
        "display": {
          enumerable:   true,  // expose in for( key in instance ) loop
          configurable: false, // allow property to be redefined later
          get: function() {
            return _.isFinite(this.calc) ? _.round(this.calc*100, this.roundTo) : null;
          },
          set: function(value) {
            this.calc = _.isFinite(value) ? value && value / 100 : null; // catch divide by zero error
          }
        }
      });

      this.callSuper(); // calls this.display = value, thus setting this.calc
    }
  });
  return TimeSeriesValue;
});