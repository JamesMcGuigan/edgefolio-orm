angular.module('ngMock').config(['$provide', function($provide) {

  // sortKeys required to ensure a unique/stable toJson() key
  function sortKeys(object) {
    var output;
    if( object instanceof Array ) {
      output = [];
      for( var i=0, n=object.length; i<n; i++ ) {
        output.push( sortKeys(object[i]) );
      }
    }
    else if( typeof object === "object" ) {
      var keys   = [];
      for( var key in object ) { keys.push(key); }
      keys = keys.sort();

      output = {};
      for( var i=0, n=keys.length; i<n; i++ ) {
        output[keys[i]] = sortKeys(object[keys[i]]); // sort by insertion order
      }
    } else {
      output = object;
    }
    return output;
  }


  $provide.decorator('$httpBackend', ['$delegate', function($delegate) {
    var $httpBackend = $delegate;
    $httpBackend.routes = {};

    var when = $httpBackend.when;
    $httpBackend.when = function(method, url, data, headers) {
      var key = angular.toJson({
        method:  String(method).toUpperCase(),
        url:     url,
        data:    sortKeys(data),
        headers: sortKeys(headers)
      });
      if( !$httpBackend.routes[key] ) {
        $httpBackend.routes[key] = when.apply(this, arguments);
      }
      return $httpBackend.routes[key];
    };

    return $httpBackend;
  }])
}]);

if( angular.module('edgefolio.models') ) {
  angular.module('edgefolio.models').requires.push('ngMock'); // Allow url redefinitions with $httpBackend.get()
}
