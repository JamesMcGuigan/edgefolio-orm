// TODO: Better organize tests
describe('Models: ApiCollection', function() {
  var $q, $injector, $httpBackend;
  var ApiBaseClass, TestClass, ApiCollection, TestApiCollection, testApiCollection;
  var json;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector     = _$injector_;
    $q            = $injector.get('$q');
    $httpBackend  = $injector.get('$httpBackend');
    ApiBaseClass  = $injector.get('ApiBaseClass');
    ApiCollection = $injector.get('ApiCollection');
  }));

  beforeEach(function() {
    json = {};
    json["/api/test/"] = json["/api/test/?page=1"] = {
      count:    6,
      previous: null,
      next:     "/api/test/?page=2",
      results: [
        { id: 1, name: "one" },
        { id: 2, name: "two" }
      ]
    };
    json["/api/test/?page=2"] = {
      count:    6,
      previous: "/api/test/?page=1",
      next:     "/api/test/?page=2",
      results: [
        { id: 3, name: "three" },
        { id: 4, name: "four" }
      ]
    };
    json["/api/test/?page=3"] = {
      count:    6,
      previous: "/api/test/?page=2",
      next:     null,
      results: [
        { id: 5, name: "five" },
        { id: 6, name: "six" }
      ]
    };

    for( var url in json ) {
      $httpBackend.when('GET', url).respond(200, json[url]);
    }
  });

  beforeEach(function() {
    TestClass = new JS.Class('TestClass', ApiBaseClass, {});
    TestApiCollection = new JS.Class('TestApiCollection', ApiCollection, {
      extend: {
        url:          "/api/test/",
        idParam:      null,
        resultsKlass: TestClass
      }
    });
  });

  context("initialization", function() {
    it("work with $loadPromise", function(done) {
      TestApiCollection.load().$loadPromise.then(function(testApiCollection) {
        expect(testApiCollection.count).equal(6);
        done();
      });
      $httpBackend.flush();
    });
    it("ApiCollection.$data.results should be id array", function(done) {
      TestApiCollection.load().$loadPromise.then(function(testApiCollection) {
        expect(testApiCollection.$data.results).to.be.a('array');
        _.each(testApiCollection.$data.results, function(result) {
          expect(result).to.be.a('number');
        });
        done();
      });
      $httpBackend.flush();
    });
    it("ApiCollection.results should be array of TestClass", function(done) {
      TestApiCollection.load().$loadPromise.then(function(testApiCollection) {
        expect(testApiCollection.results).to.be.a('array');
        _.each(testApiCollection.results, function(result) {
          expect(result).instanceof(TestClass);
        });
        expect(_.pluck(testApiCollection.results,'name')).to.deep.equal(["one","two","three","four","five","six"]);
        done();
      });
      $httpBackend.flush();
    });

    it("id singleton pattern", function() {
      var instance1 = TestApiCollection.load();
      var instance2 = TestApiCollection.load();
      expect(instance1).equal(instance2);
    });
  });

  context("loading", function() {
    it("load multiple urls", function(done) {
      TestApiCollection.load().$loadPromise.then(function(testApiCollection) {
        expect(testApiCollection.results.length).to.equal(testApiCollection.count);
        done();
      });
      $httpBackend.flush();
    });
    it("load single page of urls", function(done) {
      json["/api/test/"] = json["/api/test/?page=1"] = {
        count:    2,
        previous: null,
        next:     "/api/test/?page=2",
        results: [
          { id: 1, name: "one" },
          { id: 2, name: "two" }
        ]
      };

      for( var url in json ) {
        $httpBackend.when('GET', url).respond(200, json[url]);
      }

      TestApiCollection.load().$loadPromise.then(function(testApiCollection) {
        expect(testApiCollection.results.length).to.equal(testApiCollection.count);
        done();
      });
      $httpBackend.flush();
    })
  });
});

