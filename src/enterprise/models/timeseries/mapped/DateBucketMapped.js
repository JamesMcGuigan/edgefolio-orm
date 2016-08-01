angular.module('edgefolio.models').factory('DateBucketMapped', function(ApiFieldGenerator, DateBucket, DateBucketValue) {
  var DateBucketMapped = new JS.Class("DateBucketMapped", DateBucket, {
    /**
     * Last non-null value sorted timewise, or null if data is completely null or empty
     * @returns {*|null}
     */

    _set: function(date, value) {
      value = this.klass.mappingKlass.init(value, date, this);
      this.callSuper(date, value);
    },

    _setAllFromObject: function(timestamp_indexed_object) {
      var self = this;
      if( this.klass.mappingKlass ) {
        timestamp_indexed_object = _.mapValues(timestamp_indexed_object, function(value, date) {
          return self.klass.mappingKlass.init(value, date, self);
        });
      }
      return this.callSuper(timestamp_indexed_object);
    },

    /**
     * Return a plain object of the original values
     * @returns {Object}
     */
    toObject: function() {
      var self = this;
      return _.mapValues(this, function(value, key) {
        return self.klass.isValidValue(value) ? value.value() : null;
      });
    },

    extend: {
      mappingKlass: DateBucketValue,

      isValidValue: function(value) {
        return value && value.klass && value.isA(this.mappingKlass) || false;
      }
    }
  });
  return DateBucketMapped;
});