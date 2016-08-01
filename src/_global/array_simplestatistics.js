/**
 *  Add simplestatistics array methods to Array.prototype and lodash
 *  http://simplestatistics.org/docs/
 */
if( typeof ss !== "undefined" ) {
  ss.mixin(ss); // Add simplestatistics array methods to Array.prototype

  // Mixin simplestatistics arrayMethods to lodash without overwrite
  if( typeof _ !== "undefined" ) {
    _.mixin(
      _(ss).pick([
        // arrayMethods from libs/bower_components/simple-statistics/src/mixin.js
        'median', 'standardDeviation', 'sum', 'product',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'
      ])
      .omit(_.keys(_.prototype))
      .value()
    );
  }
}
