describe('Models: Manager', function() {
  var $q, $injector, $rootScope, $httpBackend, $timeout;
  var api_v3, Manager, ManagementCompany;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector       = _$injector_;
    $q              = $injector.get('$q');
    $timeout        = $injector.get('$timeout');
    $rootScope      = $injector.get('$rootScope');
    $httpBackend    = $injector.get('$httpBackend');

    Manager           = $injector.get('Manager');
    ManagementCompany = $injector.get('ManagementCompany');

    api_v3 = readJSON('tests/json/api/edgefolio-api-v3.json');

    api_v3['/api/managers/1/']["management_company"] = 2;
    api_v3['/api/management-companies/2/']["name"] = "La Fayette Opportunity €";

    for( var url in api_v3 ) {
      if( String(url).match(/managers|management-companies|indexes/) ) {
        $httpBackend.when('GET', url).respond(200, api_v3[url]);
      }
    }
  }));

  it("Manager should define full_name", function(done) {
    var manager = Manager.load({ id: 1 });

    manager.$loadPromise.callback(function(manager_async) {
      expect(manager).to.equal(manager_async);
      expect(manager.id).to.equal(1);

      for( var field in api_v3['/api/managers/1/'] ) {
        if( typeof api_v3['/api/managers/1/'][field] !== 'number' ) {
          expect(manager[field]).to.equal(api_v3['/api/managers/1/'][field]);
        }
      }

      var manager_data = api_v3['/api/managers/1/'];
      var full_name = [ manager_data['first_name'], manager_data['middle_name'], manager_data['last_name'] ].join(' ').replace(/\s+/g, ' ');
      expect(manager["full_name"]).to.equal(full_name);
      done();
    });
    $httpBackend.flush();
  });

  it("Manager should lazyLoad management_company and management_company_id", function(done) {
    Manager.load({ id: 1 }).$loadPromise.callback(function(manager) {
      expect(manager["management_company_id"]).to.equal(2);

      expect(manager["management_company"].name).to.equal(undefined); // lazy load not complete
      expect(manager["management_company"].id).to.equal(2);           // defined on initaliztion
      expect(manager["management_company"].klass).to.equal(ManagementCompany); // defined on initaliztion

      setTimeout(function() {
        expect(manager["management_company"].name).to.equal("La Fayette Opportunity €"); // lazy loaded
        done();
      })
    });
    $httpBackend.flush();
  });
});
