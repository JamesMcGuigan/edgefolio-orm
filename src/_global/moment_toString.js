/**
 *  moment().toISOString() generates sortable strings suitable for use in object hashes
 *  @memoized - profiler indicates that moment().toString() in DateBucket is very expensive, so cache this function
 */
if( typeof moment !== "undefined" ) {
  moment.defaultFormat = "YYYY-MM-DD\\THH:mm:ss.SSS\\Z"; // only affects moment().format() and not .toString()
  moment.tz.setDefault("UTC");                           // prevent .toString() from outputting in localtime

  if( !moment.prototype._toString ) {
    moment.prototype._toString      = moment.prototype.toString;
    moment.prototype._toISOString   = moment.prototype.toISOString;
    moment._toISOStringCache = {};

    moment.prototype.toString = moment.prototype.toISOString = function() {
      var cache_key = Number(this);
      if( !moment._toISOStringCache[cache_key] ) {
        moment._toISOStringCache[cache_key] = this._toISOString()
      }
      return moment._toISOStringCache[cache_key];
    }
  }
}
