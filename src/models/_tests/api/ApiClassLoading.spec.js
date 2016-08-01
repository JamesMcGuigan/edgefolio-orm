// TODO: Better organize tests
describe('Models: ApiBaseClass', function() {
  var $q, $injector, $rootScope, $httpBackend;
  var ApiBaseClass, ManagementCompany, TestClass;
  var api_v3;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector    = _$injector_;
    $q           = $injector.get('$q');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope   = $injector.get('$rootScope');
    ApiBaseClass = $injector.get('ApiBaseClass');
    TestClass = new JS.Class('Manager', ApiBaseClass, {
      extend: {
        url:       "/api/managers/:manager_id/",
        idParam:   "manager_id"
      }
    });


    api_v3 = readJSON('tests/json/api/edgefolio-api-v3.json');
    for( var url in api_v3 ) {
      if( _.contains(url, '/api/managers/') ) {
        $httpBackend.when('GET', url).respond(200, api_v3[url]);
      }
    }
  }));

  describe('Models: ApiBaseClass loading', function() {
    /**
     * Manager is one the simplest subclasses of abstract ApiBaseClass, so using it for test purposes
     */
    it("new ApiBaseClass() in sync mode should define id before load()", function(done) {
      expect((new TestClass({ id: 1 })).id).to.equal(1);
      expect((new TestClass({ id: 2 })).id).to.equal(2);
      expect((new TestClass({ stateParams: { manager_id: 1 } })).id).to.equal(1);
      expect((new TestClass({ stateParams: { manager_id: 2 } })).id).to.equal(2);
      expect((new TestClass({ stateParams: { manager_id: 1 } })).klass).to.equal(TestClass);
      expect((new TestClass({ stateParams: { manager_id: 1 } })).klass.displayName).to.equal("Manager");

      done();
    });

    it("ApiBaseClass.load() should return same object for duplicate ids", function(done) {
      var managers = {
        1: [
          TestClass.load({ id: 1 }),
          TestClass.load({ stateParams: { manager_id: 1 } })
        ],
        2: [
          TestClass.load({ id: 2 }),
          TestClass.load({ stateParams: { manager_id: 2 } })
        ]
      };

      expect(managers[1][0].id).to.equal(1);
      expect(managers[1][1].id).to.equal(1);
      expect(managers[2][0].id).to.equal(2);
      expect(managers[2][1].id).to.equal(2);

      expect(managers[1][0]).to.equal(managers[1][1]);
      expect(managers[2][0]).to.equal(managers[2][1]);

      expect(managers[1][0]).to.not.equal(managers[2][0]);
      expect(managers[1][1]).to.not.equal(managers[2][1]);

      done();
    });

    it("ApiBaseClass.load().$loadPromise should return a promise that waits for this.data to load", function(done) {
      var instance = TestClass.load({ id: 1 });
      expect(instance.$loaded).to.equal(false);

      instance.$loadPromise.callback(function(instance_async) {
        expect(instance).to.equal(instance_async);
        expect(instance.id).to.equal(1);
        expect(instance.$loaded).to.equal(true);

        for( var field in api_v3['/api/managers/1/'] ) {
          expect(instance.$data[field]).to.equal(api_v3['/api/managers/1/'][field]);
        }
        done();
      });
      $httpBackend.flush();
    });

    it("ApiBaseClass.load() should return a instance that initializes Object.defineProperty() before returning", function(done) {
      var instance = TestClass.load({ id: 1 });
      instance.$loadPromise.callback(function(instance_async) {
        expect(instance).to.equal(instance_async);

        for( var field in api_v3['/api/managers/1/'] ) {
          expect(instance[field]).to.equal(api_v3['/api/managers/1/'][field]);
        }
        done();
      });
      $httpBackend.flush();
    });


    it("ApiBaseClass.load({ id: invalid }) should trigger .$loadPromise.errorCallback()", function(done) {
      $httpBackend.when('GET', "/api/managers/99999/").respond(403, { "detail": "Authentication credentials were not provided." });
      TestClass.load({ id: 99999, silent: true }).$loadPromise.errorCallback(function(response) {
        expect(response.data.detail).to.equal("Authentication credentials were not provided.")
      });
      $httpBackend.flush();
      $rootScope.$apply();

      $httpBackend.when('GET', "/api/managers/88888/").respond(404, { "detail": "Not found." });
      TestClass.load({ id: 88888, silent: true }).$loadPromise.errorCallback(function(response) {
        expect(response.data.detail).to.equal("Not found.")
      });
      $httpBackend.flush();
      $rootScope.$apply();

      done();
    })
  });

  describe('Models: Deferred', function() {

    it("ApiBaseClass::$loadPromise.callback()'s should trigger in order", function(done) {
      var sequence = "before load";
      var instance  = TestClass.load({ id: 1 });
      instance.$loadPromise.callback(function() {
        expect(sequence).to.equal("before load");
        sequence = "first $loadPromise.callback";
      });
      instance.$loadPromise.callback(function() {
        expect(sequence).to.equal("first $loadPromise.callback");
        sequence = "second $loadPromise.callback";
        setTimeout(done)
      });
      $httpBackend.flush();
    });

    it("ApiBaseClass::$loadPromise.errorCallback() should trigger on .$loadPromise.reject()", function(done) {
      var instance = TestClass.load({ id: 1 });
      instance.$loadPromise.errorCallback(function(error) {
        expect(error).to.equal(undefined);
        done();
      });
      instance.$loadPromise.reject()
    });

    // NOTE: .$loadPromise.callback() allows for synchronous code when data is already loaded
    it("ApiBaseClass.load() $loadPromise.callbacks should execute after loading is complete", function(done) {
      var sequence = "before load";
      var instance = TestClass.load({ id: 1 });
      instance.$loadPromise.callback(function(instance_async) {
        expect(sequence).to.equal("before load");
        sequence = "first $loadPromise.callback";
      });

      expect(sequence).to.equal("before load");
      $httpBackend.flush();
      expect(sequence).to.equal("first $loadPromise.callback");

      instance.$loadPromise.callback(function(instance_async) {
        expect(sequence).to.equal("first $loadPromise.callback");
        sequence = "second $loadPromise.callback";
      });
      expect(sequence).to.equal("second $loadPromise.callback");

      instance.$loadPromise.callback(function(instance_async) {
        expect(sequence).to.equal("second $loadPromise.callback");
        sequence = "third $loadPromise.callback";
        done();
      });
      expect(sequence).to.equal("third $loadPromise.callback");

      instance.$loadPromise.callback(function(instance_async) {
        done();
      })
    });
  });

  describe('ApiBaseClass.$dataVersion', function() {
    it("0 on initial load", function(done) {
      var instance = TestClass.load({ id: 1 });
      expect(instance.$dataVersion).to.equal(0);
      done();
    });
    it("1 upon load({ data: })", function() {
      var instance = TestClass.load({ id: 1, data: { name: 'given' }});
      expect(instance.$dataVersion).to.equal(1);
    });
    it("1 upon $loadPromise.then", function(done) {
      var instance = TestClass.load({ id: 1 });
      instance.$loadPromise.then(function(instance_async) {
        expect(instance.$dataVersion).to.equal(1);
        done();
      });
      expect(instance.$dataVersion).to.equal(0);
      $httpBackend.flush();
    });
    it("1 upon duplicate $loadPromise.then", function(done) {
      var instance1 = TestClass.load({ id: 1 });
      var instance2 = TestClass.load({ id: 1 });
      $q.all([
        instance1.$loadPromise,
        instance2.$loadPromise
      ]).then(function() {
        expect(instance1.$dataVersion).to.equal(1);
        expect(instance2.$dataVersion).to.equal(1);
        done();
      });
      $httpBackend.flush();
    });
    it("2 upon { data: } then { load: }", function(done) {
      var instance1 = TestClass.load({ id: 1, data: { name: 'given' } });
      expect(instance1.$dataVersion).to.equal(1);

      var instance2 = TestClass.load({ id: 1, force: true });
      expect(instance1.$dataVersion).to.equal(1);
      expect(instance2.$dataVersion).to.equal(1);

      $q.all([
        instance1.$loadPromise,
        instance2.$loadPromise
      ]).then(function() {
        expect(instance1.$dataVersion).to.equal(2);
        expect(instance2.$dataVersion).to.equal(2);
        done()
      });
      $httpBackend.flush();
    });
  });

  describe('Models: ApiBaseClass.$loadPromise', function() {

    it("ApiBaseClass.$loadPromise.then() should behave as .$loadPromise.callback() but as a promise", function(done) {
      var sequence = "before load";

      var instance = TestClass.load({ id: 1 });
      instance.$loadPromise.then(function(instance_async) {
        expect(sequence).to.equal("before load");
        expect(instance).to.equal(instance_async);
        expect(instance.id).to.equal(1);

        for( var field in api_v3['/api/managers/1/'] ) {
          expect(instance[field]).to.equal(api_v3['/api/managers/1/'][field]);
        }

        sequence = "first then";
        return 42
      })
      .then(function(answer) {
        expect(sequence).to.equal("first then");
        expect(answer).to.equal(42);
        sequence = "second_then";

        setTimeout(done); // allow: expect(sequence).to.equal("second_then"); to run
      });

      expect(sequence).to.equal("before load");
      $httpBackend.flush(); // $httpBackend.flush() causes full promise chain to execute synchronously
      expect(sequence).to.equal("second_then");
    });

    it("ApiBaseClass.$loadPromise.catch() should behave as .$loadPromise.errorCallback() but as a promise", function(done) {
      this.timeout(5000);
      var sequence = "before load";

      //var instance = Manager.load({ id: 999999999 }); // loading an invalid ID $loadPromise.rejects to trigger either .catch() or .then()
      var instance = TestClass.load({ id: 1, load: false });
      instance.$loadPromise.then(function(error) {
        sequence = "first then";
        expect(sequence).to.equal("before load"); // this block shouldn't run
        done();
      });

      instance.$loadPromise['catch'](function(error) {
        expect(sequence).to.equal("before load");
        expect(error).to.equal(undefined);
        expect(instance.$data).to.eql({});

        sequence = "first catch";
        return 42;
      })
      // after a catch the chain is restored - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
      .then(function(answer) {
        expect(sequence).to.equal("first catch");
        expect(answer).to.equal(42);
        sequence = "then after catch";
        done();
      });

      expect(sequence).to.equal("before load");
      instance.$loadPromise.reject();
      expect(sequence).to.equal("before load");
      $rootScope.$apply(); // Trigger $q.when()
    });

    it("ApiBaseClass.$loadPromise.then().catch() should work", function(done) {
      var sequence = "before load";

      var instance = TestClass.load({ id: 1, load: false });
      instance.$loadPromise.then(function(error) {
        sequence = "first then";
        expect(sequence).to.equal("before load"); // this block shouldn't run
        done();
      });

      instance.$loadPromise['catch'](function(error) {
        expect(sequence).to.equal("before load");
        expect(error).to.equal(undefined);
        expect(instance.$data).to.eql({});

        sequence = "first catch";
        done();
      });

      expect(sequence).to.equal("before load");
      instance.$loadPromise.reject();
      expect(sequence).to.equal("before load");
      $rootScope.$apply(); // Trigger $q.when()
    });

    it("$q.when(ApiBaseClass.$loadPromise.load()).then() should work", function(done) {
      var instance = TestClass.load({ id: 1 });

      $q.when(instance.$loadPromise).then(function(instance_async) {
        done();
      });

      $httpBackend.flush();
      $rootScope.$apply();
    });

    it("$q.all(ApiBaseClass().$loadPromise) should work", function(done) {
      $q.all([
        TestClass.load({ id: 1 }).$loadPromise,
        TestClass.load({ id: 2 }).$loadPromise,
        TestClass.load({ id: 3 }).$loadPromise
      ])
        .then(function(managers) {
          expect(managers[0].id).to.equal(1);
          expect(managers[1].id).to.equal(2);
          expect(managers[2].id).to.equal(3);

          _.each(managers, function(instance) {
            for( var field in api_v3[instance.$getUrl()] ) {
              expect(instance[field]).to.equal(api_v3[instance.$getUrl()][field]);
            }
          });
          done()
        });
      $httpBackend.flush();
      $rootScope.apply();
    });
  });

  var ManagementCompany, Fund, ShareClass, Manager, ServiceProvider;
  describe('Models: ApiBaseClass recursive data structures', function() {
    beforeEach(inject(function(_$injector_) {
      ManagementCompany = $injector.get("ManagementCompany");
      Fund              = $injector.get("Fund");
      ShareClass        = $injector.get("ShareClass");
      Manager           = $injector.get("Manager");
      ServiceProvider   = $injector.get("ServiceProvider");

      api_v3 = readJSON('tests/json/api/edgefolio-api-v3.json');
      for( var url in api_v3 ) {
        $httpBackend.when('GET', url).respond(200, api_v3[url]);
      }
    }));

    it("should be possible to fully recurse through data model", function(done) {
      $httpBackend.when('GET', '/api/funds/17/').respond(200, readJSON('tests/json/api-v3-manual/api-funds-17.json'));
      $httpBackend.when('GET', '/api/share-classes/1233/').respond(200, readJSON('tests/json/api-v3-manual/api-share-classes-1233.json'));

      $q.all([
        ManagementCompany.load(2).$loadPromise,
        Fund.load(17).$loadPromise,
        ShareClass.load(1233).$loadPromise,
        ServiceProvider.load(1).$loadPromise,
        Manager.load(1).$loadPromise
      ]).then(function() {
        expect( ManagementCompany.load(2) ).to.equal( new ManagementCompany(2) );
        expect( ManagementCompany.load(2).fund_ids  ).to.contain( 17 );
        expect( ManagementCompany.load(2).fund_index[17] ).to.equal( Fund.load(17) );
        expect( ManagementCompany.load(2).fund_index[17].share_class_ids ).to.contain( 1233 );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233] ).to.equal( ShareClass.load(1233) );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund_id ).to.equal( 17 );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund ).to.equal( Fund.load(17) );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_ids ).to.contain( 1 );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1] ).to.equal( ServiceProvider.load(1) );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].id ).to.equal( 84 );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].management_company_id ).to.equal( 2 );
        expect( ManagementCompany.load(2).fund_index[17].share_class_index[1233].fund.service_provider_index[1].funds[0].management_company ).to.equal( ManagementCompany.load(2) );

        done();
      });

      $httpBackend.flush();
      $rootScope.$apply();
    });
  });
});
