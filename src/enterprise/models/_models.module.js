angular.module('edgefolio.models', [
  'edgefolio.constants'
]);

angular.module('edgefolio.models').value('_',          window._ );
angular.module('edgefolio.models').value('$',          window.$ );
angular.module('edgefolio.models').value('JS',         window.JS );
angular.module('edgefolio.models').value('moment',     window.moment);
angular.module('edgefolio.models').value('kurtosis',   require("compute-kurtosis"));
angular.module('edgefolio.models').value('covariance', require("compute-covariance"));

// Assumes presence of:
// - src/common_components/global/moment_toString.js:         moment.prototype.toString = moment.prototype.toISOString
// - src/common_components/global/array_simplestatistics.js:  array.prototype += ss.prototype[arrayFunctions]
