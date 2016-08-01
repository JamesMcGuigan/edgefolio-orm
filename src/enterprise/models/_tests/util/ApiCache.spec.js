describe("ApiCache consistancy", function() {
  describe('Models: ApiFieldGenerator', function() {
    beforeEach(module('edgefolio.models'));

    var $injector, $httpBackend, $rootScope;
    var ApiBaseClass, TestBaseClass, TestChildClass, TestClass1, TestClass2, AnonClass1, AnonClass2;
    var api_v3;

    beforeEach(module('edgefolio.models'));
    beforeEach(inject(function(_$injector_) {
      $injector    = _$injector_;
      $httpBackend = $injector.get('$httpBackend');
      $rootScope   = $injector.get('$rootScope');
      ApiBaseClass = $injector.get('ApiBaseClass');

      TestBaseClass = new JS.Class("TestClass", ApiBaseClass, {
        extend: {
          url:       "/api/test/:test_id/",
          idParam:   "test_id",

          defaultOptions: _.extend({}, ApiBaseClass.defaultOptions, { load: false })
        }
      });

      TestClass1 = new JS.Class("TestClass1", TestBaseClass, {});
      TestClass2 = new JS.Class("TestClass2", TestBaseClass, {});
      AnonClass1 = new JS.Class(TestBaseClass, {});
      AnonClass2 = new JS.Class(TestBaseClass, {});
    }));

    it("ApiBaseClass.load() should return equal objects", function(done) {
      expect(TestClass1.load(1)).to.equal(TestClass1.load(1));
      expect(TestClass1.load(2)).to.equal(TestClass1.load(2));
      expect(TestClass1.load(1)).to.not.equal(TestClass1.load(2));
      done();
    });

    it("ApiBaseClass.load() should return equal objects - without displayName", function(done) {
      expect(AnonClass1.load(1)).to.equal(AnonClass1.load(1));
      expect(AnonClass1.load(2)).to.equal(AnonClass1.load(2));
      expect(AnonClass1.load(1)).to.not.equal(AnonClass1.load(2));

      expect(AnonClass1.load(1)).to.not.equal(TestClass1.load(1));
      expect(AnonClass1.load(1)).to.not.equal(TestClass2.load(2));
      expect(AnonClass1.load(2)).to.not.equal(TestClass1.load(1));
      expect(AnonClass1.load(2)).to.not.equal(TestClass2.load(2));

      done();
    });

    it("new ApiBaseClass() should autocache if not defined", function(done) {
      expect(new ApiBaseClass(1)).to.equal(ApiBaseClass.load(1));
      expect(ApiBaseClass.load(2)).to.equal(new ApiBaseClass(2));

      done();
    })
  })
});
