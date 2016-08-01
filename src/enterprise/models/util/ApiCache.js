/**
 *  ApiCache[this.klass.displayName][this.id] is the global cache structure for ApiBaseClass and all children
 */
angular.module('edgefolio.models').factory('ApiCache',  function() { return {} }); // .factory() needed to reset ApiCache between tests