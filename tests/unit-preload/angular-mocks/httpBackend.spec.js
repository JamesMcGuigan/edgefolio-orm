describe("$httpBackend.when", function(done) {
  var $http, $httpBackend;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function($injector) {
    $http = $injector.get('$http');
    $httpBackend = $injector.get('$httpBackend');
  }));

  it("should allow for multiple definitions", function(done) {
    $httpBackend.when("GET", "/api/user/$httpBackend/").respond(200, { "user_id": "123" });
    $httpBackend.when("GET", "/api/user/$httpBackend/").respond(200, { "user_id": "321" });
    $http.get("/api/user/$httpBackend/").then(function(response) {
      expect(response.data.user_id).equal("321");
      done();
    }, 100);
    $httpBackend.flush();
  });

  it("should allow for whenGET shortcuts", function(done) {
    $httpBackend.whenGET(    "/api/user/$httpBackend/").respond(200, { "user_id": "123" });
    $httpBackend.when("GET", "/api/user/$httpBackend/").respond(200, { "user_id": "321" });
    $http.get("/api/user/$httpBackend/").then(function(response) {
      expect(response.data.user_id).equal("321");
      done();
    }, 100);
    $httpBackend.flush();
  });

  it("should generate different object ids for duplicate requests", function(done) {
    $httpBackend.whenGET("/api/user/$httpBackend/").respond(200, { "user_id": "123" });

    $http.get("/api/user/$httpBackend/").then(function(response1) {
      $http.get("/api/user/$httpBackend/").then(function(response2) {
        expect(response1.data === response2.data).equal(false);
        expect(response1.data).not.equal(response2.data);  // assert .equal() tests object identity
        expect(response1.data).deep.equal(response2.data); // assert .deep.equal() tests object value
        done();
      });
    });
    $httpBackend.flush(); // Only need one flush for both GETs
  })

});
