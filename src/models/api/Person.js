angular.module('edgefolio.models').factory('Person', function(ApiBaseClass) {
  var Person = new JS.Class('Person', ApiBaseClass, {
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.join(this, "full_name", ["first_name", "middle_name", "last_name"]);
    }
  });
  return Person;
});

// https://v3.edgefolio.com/api/managers/
angular.module('edgefolio.models').factory('Manager', function(ApiBaseClass, Person) {
  var Manager = new JS.Class('Manager', Person, {
    extend: {
      url:       "/api/managers/:manager_id/",
      idParam:   "manager_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company", "ManagementCompany")
    }
  });
  return Manager;
});

// https://v3.edgefolio.com/api/investors/
angular.module('edgefolio.models').factory('Investor', function(ApiBaseClass, Person) {
  var Investor = new JS.Class('Investor', Person, {
    extend: {
      url:       "/api/investors/:investor_id/",
      idParam:   "investor_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadId(this, "investment_company", "InvestmentCompany")
    }
  });
  return Investor;
});