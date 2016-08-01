// https://v3.edgefolio.com/api/user/
angular.module('edgefolio.models').factory('User', function(ApiBaseClass) {
  var User = new JS.Class('User', ApiBaseClass, {
    extend: {
      url:       "/api/user/",
      idParam:   null
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
    }
  });
  return User;
});
