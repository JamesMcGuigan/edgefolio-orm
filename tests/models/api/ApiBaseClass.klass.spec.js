// TODO: Better organize tests
describe('Models: ApiBaseClass.klass', function() {
  var $q, $injector, $rootScope;
  var ApiBaseClass, TestClass;
  var api_v3;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector    = _$injector_;
    $q           = $injector.get('$q');

    ApiBaseClass  = $injector.get('ApiBaseClass');
    TestClass = new JS.Class('TestClass', ApiBaseClass, {
      extend: {
        url:     "/api/test/:test_id/",
        idParam: "test_id",
        defaultOptions: {
          load:   true,
          silent: false
        }
      }
    });
  }));

  it('chai', function() {
    expect({ a: 1, b: 2 }).deep.equal({ a: 1, b: 2 });
    expect({ a: 1, b: 2, c: 3 }).not.deep.equal({ a: 1, b: 2 });
    expect({ a: 1, b: { c: 3 }}).deep.equal({ a: 1, b: { c: 3 } });

    expect({ a: 1, b: 2 }).to.contain({ a: 1, b: 2 });
    expect({ a: 1, b: 2, c: 3 }).to.contain({ a: 1, b: 2 });
    expect({ a: 1, b: 2 }).to.not.contain({ a: 1, d: 4 });

    // .contain does not work with nested properties
    //expect({ a: 1, b: { c: 3 }}).to.include({ a: 1, b: { c: 3 } }); //  AssertionError: expected { a: 1, b: { c: 3 } } to have a property 'b' of { c: 3 }, but got { c: 3 }
  });

  it('ApiBaseClass.klass.parseOptions()', function(done) {
    expect(TestClass.parseOptions(1)).to.contain({ id: 1, test_id: 1, load: true, silent: false });
    expect(TestClass.parseOptions("1")).to.contain({ id: 1, test_id: 1, load: true, silent: false });
    expect(TestClass.parseOptions("invalid")).to.contain({ id: "invalid", test_id: "invalid", load: true, silent: false });
    expect(TestClass.parseOptions({ id:      2 })).to.contain({ id: 2, test_id: 2, load: true, silent: false });
    expect(TestClass.parseOptions({ test_id: 3 })).to.contain({ id: 3, test_id: 3, load: true, silent: false });
    expect(TestClass.parseOptions({ stateParams: { test_id: 4 } })).to.contain({ id: 4, test_id: 4, load: true, silent: false });

    expect(TestClass.parseOptions(null, { id:      2 })).to.contain({ id: 2, test_id: 2, load: true, silent: false });
    expect(TestClass.parseOptions(null, { test_id: 3 })).to.contain({ id: 3, test_id: 3, load: true, silent: false });
    expect(TestClass.parseOptions(null, { stateParams: { test_id: 4 } })).to.contain({ id: 4, test_id: 4, load: true, silent: false });

    expect(TestClass.parseOptions(1, { silent: true  })).to.contain({ id: 1, test_id: 1, load: true, silent: true });
    expect(TestClass.parseOptions(1, { other:  "foo" })).to.contain({ id: 1, test_id: 1, load: true, silent: false, other: "foo" });

    expect(TestClass.parseOptions({ id: 1 }, { id: 2      })).to.contain({ id: 1, test_id: 1, load: true, silent: false });
    expect(TestClass.parseOptions({ id: 1 }, { test_id: 2 })).to.contain({ id: 1, test_id: 1, load: true, silent: false });

    expect(TestClass.parseOptions({ id: 1 }, { test_id: 2 })).to.contain({ id: 1, test_id: 1, load: true, silent: false });

    done();
  });
  it('ApiBaseClass.klass.parseOptions() - config.data: should set config.load and config.loaded', function(done) {
    expect(TestClass.parseOptions({ id: 1 })).to.contain({ load: true, loaded: false });
    expect(TestClass.parseOptions({ id: 1 }, { data: { a: 1 } })).to.contain({ load: false, loaded: true });
    expect(TestClass.parseOptions({ id: 1 }, { data: { a: 1 }, load: true })).to.contain({ load: true, loaded: true });
    done();
  });

  it("ApiBaseClass.klass.setName()", function(done) {
    var TestClass1 = new JS.Class("TestClass1", TestClass, {});
    var TestClass2 = new JS.Class("TestClass2", TestClass, {});
    var AnonClass1 = new JS.Class(TestClass, {});
    var AnonClass2 = new JS.Class(TestClass, {});

    expect(TestClass1.displayName).to.equal("TestClass1");
    expect(TestClass2.displayName).to.equal("TestClass2");
    expect(AnonClass1.displayName).to.equal("AnonClass-1");
    expect(AnonClass2.displayName).to.equal("AnonClass-2");

    done();
  });

  context("ApiBaseClass.toUuid()", function() {
    var TestClass1, TestClass2;
    beforeEach(function() {
      TestClass1 = new JS.Class("TestClass1", TestClass, {});
      TestClass2 = new JS.Class("TestClass2", TestClass, {});
    });
    it("empty input", function() {
      expect(TestClass1.toUuid()).to.equal(null);
    });
    it("null input", function() {
      expect(TestClass1.toUuid(null)).to.equal(null);
    });
    it("accept Number as input", function() {
      expect(TestClass1.toUuid(3)).to.equal("TestClass1:3");
      expect(TestClass2.toUuid("5")).to.equal("TestClass2:5");
    });
    it("accept uuid as input", function() {
      expect(TestClass1.toUuid("TestClass1:3")).to.equal("TestClass1:3");
      expect(TestClass2.toUuid("TestClass2:5")).to.equal("TestClass2:5");
    });
    it("accept uuid array as input", function() {
      expect(TestClass1.toUuid(["TestClass1","3"])).to.equal("TestClass1:3");
      expect(TestClass2.toUuid(["TestClass1", 5 ])).to.equal("TestClass1:5");
    });
    it("accept instance as input", function() {
      expect(TestClass1.toUuid(TestClass1.load(3))).to.equal("TestClass1:3");
      expect(TestClass2.toUuid(TestClass1.load(5))).to.equal("TestClass1:5");
    });
    it("accept $stateParams as input", function() {
      expect(TestClass1.toUuid({ test_id: 3 })).to.equal("TestClass1:3");
      expect(TestClass2.toUuid({ test_id: 5 })).to.equal("TestClass2:5");
    });
  });
  context("ApiBaseClass.toUuids()", function() {
    var TestClass1, TestClass2;

    beforeEach(function() {
      TestClass1 = new JS.Class("TestClass1", TestClass, {});
    });
    it("accept Numbers as input", function() {
      expect(TestClass1.toUuids([3,5])).to.deep.equal(["TestClass1:3","TestClass1:5"]);
    });
    it("empty input", function() {
      expect(TestClass1.toUuids()).to.deep.equal([]);
    });
    it("null input", function() {
      expect(TestClass1.toUuids(null)).to.deep.equal([]);
    });
    it("accept uuid as input", function() {
      expect(TestClass1.toUuids(["TestClass1:3","TestClass2:5"])).to.deep.equal(["TestClass1:3","TestClass2:5"]);
    });
    it("accept uuid array as input", function() {
      expect(TestClass1.toUuids([["TestClass1","3"],["TestClass1", 5 ]])).to.deep.equal(["TestClass1:3","TestClass1:5"]);
    });
    it("accept instance as input", function() {
      expect(TestClass1.toUuids([TestClass1.load(3), TestClass1.load(5)])).to.deep.equal(["TestClass1:3","TestClass1:5"]);
    });
    it("return same object literal", function() {
      expect(TestClass1.toUuids([3,5])).to.equal(TestClass1.toUuids([3,5]));
    });
    it("accept $stateParams as input", function() {
      expect(TestClass1.toUuids([{ test_id: 3 }])).to.deep.equal(["TestClass1:3"]);
    });
  })
})
