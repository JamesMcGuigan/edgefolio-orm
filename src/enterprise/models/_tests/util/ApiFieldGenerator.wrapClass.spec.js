describe('Models: ApiFieldGenerator', function() {

  var $injector;
  var Edgefolio, ApiBaseClass, TestBaseClass, TestChildClass, ApiFieldGenerator;
  var testClassData, overwriteData, overwriteInstance, DateBucket, TestClass, testClassInstance;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector         = _$injector_;
    ApiBaseClass      = $injector.get('ApiBaseClass');
    ApiFieldGenerator = $injector.get('ApiFieldGenerator');
    DateBucket        = $injector.get('DateBucket');

    testClassData     = {
      "2008-11-30T00:00:00.000Z": 0.38623,
      "2009-07-31T00:00:00.000Z": 1.64582
    };
    overwriteData     = { "2008-11-30T00:00:00.000Z": 0.38623 };
    overwriteInstance = new DateBucket(overwriteData);

    TestBaseClass = new JS.Class("TestClass", ApiBaseClass, {
      extend: {
        url: "/api/test/:test_id/",
        idParam: "test_id",

        defaultOptions: _.extend({}, ApiBaseClass.defaultOptions, { load: false })
      }
    });
    TestChildClass = new JS.Class("TestBaseClass", TestBaseClass, {});
    TestClass  = new JS.Class(TestBaseClass, {
      $initializeObjectProperties: function(data) {
        this.callSuper();
        this.klass.ApiFieldGenerator.wrapClassReadOnly(this, "wrapClassReadOnly", DateBucket);
        this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "wrapClassOverwrite", DateBucket);
      }
    });
    testClassInstance = new TestClass({
      id: 1,
      data: {
        wrapClassReadOnly:  _.cloneDeep(testClassData),
        wrapClassOverwrite: _.cloneDeep(testClassData)
      }
    });
  }));

  context("ApiFieldGenerator.wrapClass*()", function() {
    it("wrapClassReadOnly(): this.$cache should be null before first access", function() {
      expect(testClassInstance.$data.wrapClassReadOnly).to.deep.equal(testClassData);
      expect(testClassInstance.$cache.wrapClassReadOnly).to.equal(undefined);
    });
    it("wrapClassOverwrite(): this.$cache should be null before first access", function() {
      expect(testClassInstance.$data.wrapClassOverwrite).to.deep.equal(testClassData);
      expect(testClassInstance.$cache.wrapClassOverwrite).to.equal(undefined);
    });


    it("wrapClassReadOnly(): return instance of DateBucket on read", function() {
      expect(testClassInstance.wrapClassReadOnly).instanceof(DateBucket);
    });
    it("wrapClassOverwrite(): return instance of DateBucket on read", function() {
      expect(testClassInstance.wrapClassOverwrite).instanceof(DateBucket);
    });

    it("wrapClassReadOnly(): not overwrite this.$data", function() {
      expect(testClassInstance.wrapClassReadOnly).to.equal(testClassInstance.$cache.wrapClassReadOnly);
      expect(testClassInstance.wrapClassReadOnly).to.not.equal(testClassInstance.$data.wrapClassReadOnly);
      expect(testClassInstance.$data.wrapClassReadOnly).not.instanceof(DateBucket);
      expect(testClassInstance.wrapClassReadOnly).to.contain(testClassInstance.$data.wrapClassReadOnly);
    });
    it("wrapClassOverwrite(): overwrite this.$data", function() {
      expect(testClassInstance.wrapClassOverwrite).to.equal(testClassInstance.$data.wrapClassOverwrite);
      expect(testClassInstance.wrapClassOverwrite).to.not.equal(testClassInstance.$cache.wrapClassOverwrite);
      expect(testClassInstance.$data.wrapClassOverwrite).instanceof(DateBucket);
      expect(testClassInstance.wrapClassOverwrite).to.contain(testClassInstance.$data.wrapClassOverwrite);
    });

    it("wrapClassReadOnly(): create new instance of DateBucket for object literal set", function() {
      testClassInstance.wrapClassReadOnly = overwriteData;
      expect(testClassInstance.wrapClassReadOnly).to.contain(overwriteData);
      expect(testClassInstance.wrapClassReadOnly).to.not.equal(overwriteData);

      expect(testClassInstance.$data.wrapClassReadOnly).to.deep.equal(testClassData);
      expect(testClassInstance.$cache.wrapClassReadOnly).to.deep.equal(overwriteData);
      expect(testClassInstance.wrapClassReadOnly).to.equal(testClassInstance.$cache.wrapClassReadOnly);
    });
    it("wrapClassOverwrite(): create new instance of DateBucket for object literal set", function() {
      testClassInstance.wrapClassOverwrite = overwriteData;
      expect(testClassInstance.wrapClassOverwrite).to.contain(overwriteData);
      expect(testClassInstance.wrapClassOverwrite).to.not.equal(overwriteData);

      expect(testClassInstance.wrapClassOverwrite).to.equal(testClassInstance.$data.wrapClassOverwrite);
      expect(testClassInstance.$cache.wrapClassOverwrite).to.deep.equal(undefined);
    });

    it("wrapClassReadOnly(): create new instance of DateBucket for object literal set", function() {
      testClassInstance.wrapClassReadOnly = overwriteData;
      expect(testClassInstance.wrapClassReadOnly).to.contain(overwriteData);
      expect(testClassInstance.wrapClassReadOnly).to.not.equal(overwriteData);

      expect(testClassInstance.$data.wrapClassReadOnly).to.deep.equal(testClassData);
      expect(testClassInstance.$cache.wrapClassReadOnly).to.deep.equal(overwriteData);
      expect(testClassInstance.wrapClassReadOnly).to.equal(testClassInstance.$cache.wrapClassReadOnly);
    });
    it("wrapClassOverwrite(): create new instance of DateBucket for object literal set", function() {
      testClassInstance.wrapClassOverwrite = overwriteData;
      expect(testClassInstance.wrapClassOverwrite).to.contain(overwriteData);
      expect(testClassInstance.wrapClassOverwrite).to.not.equal(overwriteData);

      expect(testClassInstance.$data.wrapClassOverwrite).to.contain(overwriteData);
      expect(testClassInstance.$cache.wrapClassOverwrite).to.deep.equal(undefined);
      expect(testClassInstance.wrapClassOverwrite).to.equal(testClassInstance.$data.wrapClassOverwrite);
    });


    it("wrapClassReadOnly(): create new instance of DateBucket for klass set", function() {
      testClassInstance.wrapClassReadOnly = overwriteInstance;
      expect(testClassInstance.wrapClassReadOnly).to.equal(overwriteInstance);
      expect(testClassInstance.$cache.wrapClassReadOnly).to.equal(overwriteInstance);
      expect(testClassInstance.$data.wrapClassReadOnly).to.deep.equal(testClassData);
      expect(testClassInstance.wrapClassReadOnly).to.equal(testClassInstance.$cache.wrapClassReadOnly);
      expect(testClassInstance.wrapClassReadOnly).to.not.equal(testClassInstance.$data.wrapClassReadOnly);
    });
    it("wrapClassOverwrite(): create new instance of DateBucket for klass set", function() {
      testClassInstance.wrapClassOverwrite = overwriteInstance;
      expect(testClassInstance.wrapClassOverwrite).to.equal(overwriteInstance);
      expect(testClassInstance.$data.wrapClassOverwrite).to.equal(overwriteInstance);
      expect(testClassInstance.$cache.wrapClassOverwrite).to.equal(undefined);
      expect(testClassInstance.wrapClassOverwrite).to.equal(testClassInstance.$data.wrapClassOverwrite);
      expect(testClassInstance.wrapClassOverwrite).to.not.equal(testClassInstance.$cache.wrapClassOverwrite);
    });
  });
});