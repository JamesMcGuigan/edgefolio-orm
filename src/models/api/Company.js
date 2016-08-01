angular.module("edgefolio.models").factory("Company", function(ApiBaseClass, CountryCodes) {
  var Company = new JS.Class("Company", ApiBaseClass, {
    extend: {
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.objectAlias(this, "contact_information", ["address_line_1", "address_line_2", "postal_code", "city", "country_code", "province", "latitude", "longitude", "phone", "fax", "email", "homepage"]);
      this.klass.ApiFieldGenerator.lookupAlias(this, "country", "country_code", CountryCodes);
      this.klass.ApiFieldGenerator.join(this, "address", ["address_line_1", "address_line_2", "city", "postal_code", "country", "province"], ', ');
    }
  });
  return Company;
});

angular.module("edgefolio.models").factory("ManagementCompany", function(ApiBaseClass, Company) {
  var ManagementCompany = new JS.Class("ManagementCompany", Company, {
    extend: {
      url:       "/api/management-companies/:management_company_id/",
      idParam:   "management_company_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "employees", "Manager");
    }
  });
  return ManagementCompany;
});

angular.module("edgefolio.models").factory("InvestmentCompany", function(ApiBaseClass, Company) {
  var InvestmentCompany = new JS.Class("InvestmentCompany", Company, {
    extend: {
      url:       "/api/investment-companies/:investment_company_id/",
      idParam:   "investment_company_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "employees", "Investor");
    }
  });
  return InvestmentCompany;
});

angular.module("edgefolio.models").factory("ServiceProvider", function(ApiBaseClass, Company) {
  var ServiceProvider = new JS.Class("ServiceProvider", Company, {
    extend: {
      url:       "/api/service-providers/:service_provider_id/",
      idParam:   "service_provider_id"
    },
    $initializeObjectProperties: function(data) {
      this.callSuper.apply(this, arguments);
      this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "funds", "Fund");
      this.klass.ApiFieldGenerator.unCamelCase(this, "provider_kind");
    }
  });
  return ServiceProvider;
});
