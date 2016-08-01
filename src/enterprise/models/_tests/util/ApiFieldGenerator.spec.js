
describe('Models: ApiFieldGenerator', function() {
  beforeEach(module('edgefolio.models'));

  var $injector, $httpBackend, $rootScope;
  var Edgefolio, ApiBaseClass, TestBaseClass, TestChildClass, ApiFieldGenerator;
  var api_v3;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector    = _$injector_;
    $httpBackend = $injector.get('$httpBackend');
    $rootScope   = $injector.get('$rootScope');
    ApiBaseClass = $injector.get('ApiBaseClass');
    ApiFieldGenerator = $injector.get('ApiFieldGenerator');

    TestBaseClass = new JS.Class("TestClass", ApiBaseClass, {
      extend: {
        url:       "/api/test/:test_id/",
        idParam:   "test_id",

        defaultOptions: _.extend({}, ApiBaseClass.defaultOptions, { load: false })
      }
    });

    TestChildClass = new JS.Class("TestChildClass", TestBaseClass, {});
  }));

  describe("utils", function() {
    it("ApiFieldGenerator._getId()", function(done) {
      expect( ApiFieldGenerator._getId(1)    ).to.equal(1);
      expect( ApiFieldGenerator._getId(10)   ).to.equal(10);
      expect( ApiFieldGenerator._getId("11") ).to.equal("11");
      expect( ApiFieldGenerator._getId({ id: 2 })  ).to.equal(2);
      expect( ApiFieldGenerator._getId({ id: 10 }) ).to.equal(10);
      expect( ApiFieldGenerator._getId()     ).to.equal(null);
      expect( ApiFieldGenerator._getId(null) ).to.equal(null);
      done();
    });

    it("ApiFieldGenerator._convertSelectorToArray()", function(done) {
      _.each([
        { input: 'a',           expected: ['a'] },
        { input: 'a.b.c',       expected: ['a','b','c'] },
        { input: ['a'],         expected: ['a'] },
        { input: [['a'],['b']], expected: ['a','b'] },
        { input: ['a','b','c'], expected: ['a','b','c'] },
        { input: ['a','b.c'],   expected: ['a','b.c'] }
      ], function(config) {
        expect( ApiFieldGenerator._convertSelectorToArray(config.input), JSON.stringify(config) ).to.deep.equal(config.expected);
      })
      done();
    });

    it("ApiFieldGenerator._getKlass()", function(done) {
      console._error = console.error; console.error = _.noop;

      expect( ApiFieldGenerator._getKlass(ApiBaseClass) ).to.equal(ApiBaseClass);
      expect( ApiFieldGenerator._getKlass("ApiBaseClass") ).to.equal(ApiBaseClass);
      expect( ApiFieldGenerator._getKlass("NotAKlass") ).to.equal(null);

      console.error = console._error; delete console._error;
      done();
    });

    context("ApiFieldGenerator.selfCaching()", function() {
      var instance, count;
      beforeEach(function() {
        count = 0;
        instance = {};
        ApiFieldGenerator.selfCaching(instance, "field_0", function() { return count++; });
      });
      it("hash syntax", function() {
        ApiFieldGenerator.selfCaching(instance, {
          "field_1": function() { return 1; },
          "field_2": function() { return 2; }
        });
        expect(instance.field_1).to.equal(1);
        expect(instance.field_2).to.equal(2);
      });
      it("set function", function() {
        expect(instance.field_0).to.equal(0);
      });
      it("cache output", function() {
        expect(instance.field_0).to.equal(0);
        expect(instance.field_0).to.equal(0);
      });
      it("cache function", function() {
        expect(instance.field_0).to.equal(0);
        expect(instance.field_0).to.equal(0);
      });
      it("cache invalidation", function() {
        expect(instance.field_0).to.equal(0);
        expect(instance.field_0).to.equal(0);
        ApiFieldGenerator.selfCaching(instance, "field_0", function() { return count++; });
        expect(instance.field_0).to.equal(1);
        expect(instance.field_0).to.equal(1);
      });
    });
    it("ApiFieldGenerator.defineProperty()", function(done) {
      var instance = {
        $fields: {}
      };

      // Test ApiFieldGenerator.defineProperty works
      ApiFieldGenerator.defineProperty(instance, "field_1", { get: function() { return "test_1::field_1::one"; } }, { generator: "test_1" });
      expect(instance["field_1"]).to.equal("test_1::field_1::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: true }});

      // Test ApiFieldGenerator.defineProperty works for second field property
      ApiFieldGenerator.defineProperty(instance, "field_2", { get: function() { return "test_1::field_2::one"; } }, { generator: "test_1" });
      expect(instance["field_1"]).to.equal("test_1::field_1::one");
      expect(instance["field_2"]).to.equal("test_1::field_2::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: true, field_2: true }});

      // priority: true should not trigger for same generator:field key
      ApiFieldGenerator.defineProperty(instance, "field_1", { get: function() { return "test_1::field_1::two"; } }, { generator: "test_1", priority: true });
      expect(instance["field_1"]).to.equal("test_1::field_1::one");
      expect(instance["field_2"]).to.equal("test_1::field_2::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: true, field_2: true }});

      // overwrite: true should trigger for same generator:field key
      ApiFieldGenerator.defineProperty(instance, "field_1", { get: function() { return "test_1::field_1::two"; } }, { generator: "test_1", priority: false, overwrite: true });
      expect(instance["field_1"]).to.equal("test_1::field_1::two");
      expect(instance["field_2"]).to.equal("test_1::field_2::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: true, field_2: true }});

      // priority: true should trigger for different generator:field key
      ApiFieldGenerator.defineProperty(instance, "field_1", { get: function() { return "test_2::field_1::two"; } }, { generator: "test_2", priority: true });
      expect(instance["field_1"]).to.equal("test_2::field_1::two");
      expect(instance["field_2"]).to.equal("test_1::field_2::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: false, field_2: true }, test_2: { field_1: true }});

      // passing generator as string, should default to { priority: true, overwrite: false }
      ApiFieldGenerator.defineProperty(instance, "field_1", { get: function() { return "test_2::field_1::three"; } }, "test_3");
      expect(instance["field_1"]).to.equal("test_2::field_1::three");
      expect(instance["field_2"]).to.equal("test_1::field_2::one");
      expect(instance.$fields).to.deep.equal({ test_1: { field_1: false, field_2: true }, test_2: { field_1: false }, test_3: { field_1: true }});

      done();
    });
  });

  describe("ApiFieldGenerator::helpers", function() {
    var instance;
    beforeEach(inject(function(_$injector_) {
      instance = new ApiBaseClass(1, { data: { one: "One", two: "Two", three: "Three", camel: "LongCamelCaseString" }});
    }));

    context('ApiFieldGenerator.alias()', function() {
      it('simple selectors', function(done) {
        ApiFieldGenerator.alias(instance, 'one_alias', 'one');
        expect(instance.one).to.equal('One');
        expect(instance.one_alias).to.equal('One');
        expect(instance.$fields).to.include.keys('alias');

        instance.one_alias = 1;
        expect(instance.one_alias).to.equal(1);
        expect(instance.one).to.equal(1);

        done()
      });

      _.forEach([
        { alias: 'x.y.z',       field: 'a.b.c' },
        { alias: ['x','y','z'], field: 'a.b.c' },
        { alias: 'x.y.z',       field: ['a','b','c'] },
        { alias: ['x','y','z'], field: ['a','b','c'] }
        // { alias: ['x.y','z'],   field: ['a','b.c'] } // Lodash does not support this mixed syntax
      ], function(config) {
        it('deep selectors: ' + JSON.stringify(config), function(done) {
          instance.$setData({ a: { b: { c: 0 } } } );
          ApiFieldGenerator.alias(instance, config.alias, config.field);
          expect(_.get(instance, config.alias)).to.equal(0);
          expect(_.get(instance, config.field)).to.equal(0);

          // Ensure its an alias and not a copy
          _.set(instance, config.field, 1);
          expect(_.get(instance, config.alias)).to.equal(1);
          expect(_.get(instance, config.field)).to.equal(1);

          // Ensure its a two way write alias
          _.set(instance, config.alias, 2);
          expect(_.get(instance, config.alias)).to.equal(2);
          expect(_.get(instance, config.field)).to.equal(2);
          done()
        });
      });

      it('multiple deep selectors covering the same tree', function(done) {
        instance.$setData({ a: { b: { c: 1, d: 2 }} });
        ApiFieldGenerator.alias(instance, 'x.y.1', 'a.b.c');
        ApiFieldGenerator.alias(instance, 'x.y.2', 'a.b.d');

        expect(_.get(instance, 'x.y.1')).to.equal(1);
        expect(_.get(instance, 'x.y.2')).to.equal(2);
        done();
      })
    });

    context('ApiFieldGenerator.aliasFunction()', function() {
      it('simple selectors', function() {
        instance.$setData({ a: function() { return 0; } });
        ApiFieldGenerator.aliasFunction(instance, 'x', 'a()');
        expect( instance.x ).to.equal(0);
      });
      it('deep selectors', function() {
        instance.$setData({ a: { b: { c: function() { return 0; } } } });
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a.b.c()');
        expect( _.get(instance, 'x.y.z'), JSON.stringify({ x: instance.x }) ).to.equal(0);
      });
      it('null field', function() {
        console._error = console.error; console.error = function() {};
        instance.$setData({ a: { b: { c: null } } });
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a.b.c()');
        expect( _.get(instance, 'x.y.z'), JSON.stringify({ x: instance.x }) ).to.equal(null);
        console.error = console._error; delete console._error;
      });
      it('undefined field', function() {
        console._error = console.error; console.error = function() {};
        instance.$setData({});
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a.b.c()');
        expect( _.get(instance, 'x.y.z'), JSON.stringify({ x: instance.x }) ).to.equal(null);
        console.error = console._error; delete console._error;
      });
      it('with context', function() {
        instance.$setData({ a: { b: { c: function() { return this.value; } } }, nested: { context: { value: 0 } }});
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a.b.c()', instance.nested.context);
        expect( _.get(instance, 'x.y.z'), JSON.stringify({ x: instance.x }) ).to.equal(0);
      });
      it('with context - as string', function() {
        instance.$setData({ a: { b: { c: function() { return this.value; } } }, nested: { context: { value: 0 } }});
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a.b.c()', 'nested.context');
        expect( _.get(instance, 'x.y.z'), JSON.stringify({ x: instance.x }) ).to.equal(0);
      });
      it('with multiple', function() {
        instance.$setData({ a: function() { return { b: function() { return { c: 0 } }}}});
        ApiFieldGenerator.aliasFunction(instance, 'x.y.z', 'a().b().c');
        expect( instance.x.y.z, JSON.stringify({ x: instance.x }) ).to.equal(0);
      });


    });

    context('ApiFieldGenerator.objectAlias()', function() {
      it('simple selectors', function(done) {
        ApiFieldGenerator.objectAlias(instance, 'objectAlias', ['two', 'three']);
        expect(instance.objectAlias).to.deep.equal({ two: "Two", three: "Three" });
        expect(instance.$fields).to.include.keys('objectAlias');

        instance.objectAlias.two = 2;
        expect(instance.objectAlias.two).to.equal(2);
        expect(instance.two).to.equal(2);
        done()
      });
      _.forEach([
        { alias: 'x',       fields: ['a'],       lookup: 'x.a.b.c' },
        { alias: 'x.y.z',   fields: ['a'],       lookup: 'x.y.z.a.b.c' },
        { alias: 'x.y.z',   fields: ['a.b.c'],   lookup: 'x.y.z.c' },
        { alias: 'x.y',     fields: ['a.b'],     lookup: 'x.y.b.c' },
        { alias: ['x','y'], fields: [['a','b']], lookup: 'x.y.b.c' }
      ], function(config) {
        it('deep selectors: ' + JSON.stringify(config), function(done) {
          instance.$setData({ a: { b: { c: 1 }} });

          // Read lookup
          ApiFieldGenerator.objectAlias(instance, config.alias, config.fields);
          expect(_.get(instance, config.lookup), JSON.stringify({ x: instance.x })).to.equal(1);
          expect(_.get(instance, 'a.b.c')).to.equal(1);

          // Ensure its an alias and not a copy
          _.set(instance, 'a.b.c', 2);
          expect(_.get(instance, config.lookup), JSON.stringify({ x: instance.x })).to.equal(2);
          expect(_.get(instance, 'a.b.c')).to.equal(2);

          // Ensure its a two way write alias
          _.set(instance, config.lookup, 3);
          expect(_.get(instance, config.lookup), JSON.stringify({ x: instance.x })).to.equal(3);
          expect(_.get(instance, 'a.b.c')).to.equal(3);
          done()
        });
      });
    });


    it('ApiFieldGenerator.unCamelCase()', function(done) {
      ApiFieldGenerator.unCamelCase(instance, 'camel');
      expect(instance.camel).to.equal("Long Camel Case String");
      expect(instance.$fields).to.include.keys('unCamelCase');

      instance.camel = "Another Different String";
      expect(instance.camel).to.equal("Another Different String");
      expect(instance.$data.camel).to.equal("AnotherDifferentString");

      done()
    });

    it('ApiFieldGenerator.join()', function(done) {
      ApiFieldGenerator.join(instance, 'join1', ['one','two','undefined','three']);
      ApiFieldGenerator.join(instance, 'join2', ['one','two','undefined','three'], ', ');
      expect(instance.join1).to.equal("One Two Three");
      expect(instance.join2).to.equal("One, Two, Three");
      expect(instance.$fields).to.include.keys('join');

      done()
    });

    it('ApiFieldGenerator.lookupAlias()', function(done) {
      var lookupTable = { "One": 1, "Two": 2, "Three": 3 };
      ApiFieldGenerator.lookupAlias(instance, 'lookup_one', 'one', lookupTable);
      ApiFieldGenerator.lookupAlias(instance, 'lookup_two', 'two', lookupTable);

      expect(instance.lookup_one).to.equal(1);
      expect(instance.lookup_two).to.equal(2);

      instance.lookup_one = 3;
      expect(instance.lookup_one).to.equal(3);
      expect(instance.one).to.equal("Three");

      instance.lookup_one = 4;
      expect(instance.lookup_one).to.equal(null);
      expect(instance.one).to.equal(null);

      expect(instance.$fields).to.include.keys('lookup');
      done()
    });
  });

  describe("ApiFieldGenerator['static']", function() {
    it("ApiFieldGenerator['static'] should generate a default pointer to this.data", function(done) {
      var TestClass = new JS.Class("TestClass", TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.klass.ApiFieldGenerator['static'](this, "name");
        }
      });
      var testClass = new TestClass({ id: 1, data: { name: "original" } });

      expect(testClass.$data.name).to.equal("original");
      expect(testClass.name).to.equal("original");

      testClass.name = "replaced";
      expect(testClass.$data.name).to.equal("replaced");
      expect(testClass.name).to.equal("replaced");

      done();
    });

    it("ApiFieldGenerator['static'] should generate a pointer to object argument", function(done) {
      var TestClass = new JS.Class("TestClass", TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.test_1 = {};
          this.test_2 = {};
          this.klass.ApiFieldGenerator['static'](this, "first_name", this.test_1);
          this.klass.ApiFieldGenerator['static'](this, "last_name", this.test_2);
        }
      });
      var testClass = new TestClass({ id: 1, data: { first_name: "original first", last_name: "original last" } });

      expect(testClass.$data.first_name).to.equal("original first");
      expect(testClass.$data.last_name).to.equal("original last");
      expect(testClass.test_1.first_name).to.equal(undefined);
      expect(testClass.test_2.first_name).to.equal(undefined);
      expect(testClass.test_1.last_name).to.equal(undefined);
      expect(testClass.test_2.last_name).to.equal(undefined);

      expect(testClass.first_name).to.equal(undefined);
      expect(testClass.last_name).to.equal(undefined);

      testClass.first_name = "replaced first";
      testClass.last_name  = "replaced last";

      expect(testClass.first_name).to.equal("replaced first");
      expect(testClass.last_name).to.equal("replaced last");

      expect(testClass.$data.first_name).to.equal("original first");
      expect(testClass.$data.last_name).to.equal("original last");
      expect(testClass.test_1.first_name).to.equal("replaced first");
      expect(testClass.test_2.first_name).to.equal(undefined);
      expect(testClass.test_1.last_name).to.equal(undefined);
      expect(testClass.test_2.last_name).to.equal("replaced last");

      done();
    });
  });

  describe("ApiFieldGenerator.lazyLoadId()", function() {
    it("ApiFieldGenerator.lazyLoadId() should generate new class", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestChildClass);
        }
      });
      var testClass = new TestClass({ id: 1, data: { child: 2 }});

      expect(testClass.$data.child).to.equal(2);
      expect(testClass.child_id).to.equal(2);
      expect(testClass.child.id).to.equal(2);
      expect(testClass.child.klass).to.equal(TestChildClass);

      done();
    });

    it("ApiFieldGenerator.lazyLoadId() update child_id on set()", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestChildClass);
        }
      });
      var testClass         = new TestClass({ id: 1, data: { child: 2 } });
      var newTestChildClass = new TestChildClass({ id: 3 });

      expect(testClass.$data.child).to.equal(2);
      expect(testClass.child_uuid).to.equal('TestChildClass:2');
      expect(testClass.child.uuid).to.equal('TestChildClass:2');
      expect(testClass.child_id).to.equal(2);
      expect(testClass.child.id).to.equal(2);
      expect(testClass.child.klass).to.equal(TestChildClass);

      expect(testClass.child.klass).to.equal(TestChildClass);
      expect(newTestChildClass.id).to.equal(3);
      testClass.child = newTestChildClass;

      expect(testClass.$data.child).to.equal(3);
      expect(testClass.child_id).to.equal(3);
      expect(testClass.child.id).to.equal(3);
      expect(testClass.child_uuid).to.equal('TestChildClass:3');
      expect(testClass.child.uuid).to.equal('TestChildClass:3');
      expect(testClass.child.klass).to.equal(TestChildClass);

      done();
    });


    it("ApiFieldGenerator.lazyLoadId() with predefined data", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestChildClass);
        }
      });
      var testClass = new TestClass({ id: 1, data: { child: { id: 2, name: "preloaded name" } }});

      expect(testClass.$data.child).to.equal(2);
      expect(testClass.child_id).to.equal(2);
      expect(testClass.child.id).to.equal(2);
      expect(testClass.child.klass).to.equal(TestChildClass);

      expect(TestChildClass.load(2).name).to.equal("preloaded name"); // should auto cache preloaded data

      done();
    });

    it("ApiFieldGenerator.lazyLoadId() - reading with doubly nested data", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestClass);
        }
      });
      var testClass = TestClass.load({ id: 1, data: {
        child: {
          id: 2,
          name: "two",
          child: {
            id: 3,
            name: "three"
          }
        }
      }});

      expect(testClass.child_id).to.equal(2);
      expect(testClass.child).to.exist;
      expect(testClass.child.$loaded).to.equal(true);
      expect(testClass.child.name).to.equal("two");

      expect(testClass.child.child_id).to.equal(3);
      expect(testClass.child.child).to.exist;
      expect(testClass.child.child.$loaded).to.equal(true);
      expect(testClass.child.child.name).to.equal("three");

      done();
    });

    it("ApiFieldGenerator.lazyLoadId() - writing", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestClass);
        }
      });
      var testClass = TestClass.load({ id: 1, data: { child: 2 }});

      expect(testClass.child.klass).to.equal(TestClass);
      expect(testClass.child_id).to.equal(2);
      expect(testClass.child.id).to.equal(2);

      testClass.child = 3;
      expect(testClass.child.klass).to.equal(TestClass);
      expect(testClass.child_id).to.equal(3);
      expect(testClass.child.id).to.equal(3);

      testClass.child = { id: 4 };
      expect(testClass.child.klass).to.equal(TestClass);
      expect(testClass.child_id).to.equal(4);
      expect(testClass.child.id).to.equal(4);

      done();
    });
  });


  describe("ApiFieldGenerator.lazyLoadIdArray()", function() {
    it("ApiFieldGenerator.lazyLoadIdArray() - reading children_index", function(done) {
      var TestClass = new JS.Class("TestBaseClass", TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "children", TestChildClass);
        }
      });

      var testClass = new TestClass({ id: 1, data: { children: [2,4,6,8] }});

      expect(testClass.$data.children).to.deep.equal([2,4,6,8]);
      expect(testClass.children_ids).to.deep.equal([2,4,6,8]);
      expect(testClass.children_uuids).to.deep.equal(['TestChildClass:2','TestChildClass:4','TestChildClass:6','TestChildClass:8']);

      expect(testClass.children_index[1]).to.not.exist;
      expect(testClass.children_index[2]).to.exist;
      expect(testClass.children_index[3]).to.not.exist;
      expect(testClass.children_index[4]).to.exist;
      expect(testClass.children_index[5]).to.not.exist;
      expect(testClass.children_index[6]).to.exist;
      expect(testClass.children_index[7]).to.not.exist;
      expect(testClass.children_index[8]).to.exist;

      expect(testClass.children_index[2].id).to.equal(2);
      expect(testClass.children_index[4].id).to.equal(4);
      expect(testClass.children_index[6].id).to.equal(6);
      expect(testClass.children_index[8].id).to.equal(8);

      expect(testClass.children_index[2].klass).to.equal(TestChildClass);
      expect(testClass.children_index[4].klass).to.equal(TestChildClass);
      expect(testClass.children_index[6].klass).to.equal(TestChildClass);
      expect(testClass.children_index[8].klass).to.equal(TestChildClass);


      expect(Array.isArray(testClass.children)).to.equal(true);
      expect(Array.isArray(testClass.children_index)).to.equal(false);
      expect(testClass.children.length).to.equal(4);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.pluck(testClass.children,'uuid')).to.deep.equal(testClass.children_uuids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      expect(testClass.children[0]).to.equal(testClass.children_index[2]);
      expect(testClass.children[1]).to.equal(testClass.children_index[4]);
      expect(testClass.children[2]).to.equal(testClass.children_index[6]);
      expect(testClass.children[3]).to.equal(testClass.children_index[8]);

      done();
    });

    it("ApiFieldGenerator.lazyLoadIdArray() - writing", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "children", TestChildClass);
        }
      });

      var testClass = new TestClass({ id: 1, data: { children: [2,4,6,8] }});
      expect(testClass.children_ids).to.deep.equal([2,4,6,8]);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      testClass.children = [1,3];
      expect(testClass.children_ids).to.deep.equal([1,3]);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      expect(testClass.children[0]).to.deep.equal(testClass.children_index[1]);
      expect(testClass.children[1]).to.deep.equal(testClass.children_index[3]);

      testClass.children = [{ id: 4 }, { id: 5 }];
      expect(testClass.children_ids).to.deep.equal([4,5]);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      expect(testClass.children[0]).to.deep.equal(testClass.children_index[4]);
      expect(testClass.children[1]).to.deep.equal(testClass.children_index[5]);


      testClass.children_ids = [8,9];
      expect(testClass.children_ids).to.deep.equal([8,9]);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      expect(testClass.children[0]).to.deep.equal(testClass.children_index[8]);
      expect(testClass.children[1]).to.deep.equal(testClass.children_index[9]);

      testClass.children_index = { 12: { id: 12 }, 16: { id: 16 } };
      expect(testClass.children_ids).to.deep.equal([12,16]);
      expect(_.pluck(testClass.children,'id')).to.deep.equal(testClass.children_ids);
      expect(_.keys(testClass.children_index)).to.deep.equal(testClass.children_ids.map(String));

      expect(testClass.children[0]).to.deep.equal(testClass.children_index[12]);
      expect(testClass.children[1]).to.deep.equal(testClass.children_index[16]);

      done();
    });


    it("ApiFieldGenerator.lazyLoadIdArray() - reading with predefined data", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "children", TestChildClass);
        }
      });
      var testClass = new TestClass({ id: 1, data: { children: [
        { id: 2, name: "two" },
        { id: 4, name: "four" }
      ]}});

      expect(testClass.$data.children).to.deep.equal([2,4]);
      expect(testClass.children_ids).to.deep.equal([2,4]);

      expect(testClass.children_index[1]).to.not.exist;
      expect(testClass.children_index[2]).to.exist;
      expect(testClass.children_index[3]).to.not.exist;
      expect(testClass.children_index[4]).to.exist;

      expect(testClass.children_index[2].id).to.equal(2);
      expect(testClass.children_index[4].id).to.equal(4);
      expect(testClass.children_index[2].name).to.equal("two");
      expect(testClass.children_index[4].name).to.equal("four");

      expect(testClass.children_index[2].klass).to.equal(TestChildClass);
      expect(testClass.children_index[4].klass).to.equal(TestChildClass);

      done();
    });

    it("ApiFieldGenerator.lazyLoadIdArray() - reading with doubly nested data", function(done) {
      var TestClass = new JS.Class(TestBaseClass, {
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "children", TestClass);
        }
      });
      var testClass = TestClass.load({ id: 1, data: { children: [
        {
          id: 2,
          name: "two",
          children: [{
            id: 3,
            name: "three"
          }]
        }
      ]}});

      expect(testClass.children_ids).to.deep.equal([2]);
      expect(testClass.children_index[2]).to.exist;
      expect(testClass.children_index[2].$loaded).to.equal(true);
      expect(testClass.children_index[2].name).to.equal("two");

      expect(testClass.children_index[2].children_ids).to.deep.equal([3]);
      expect(testClass.children_index[2].children_index[3]).to.exist;
      expect(testClass.children_index[2].children_index[3].$loaded).to.equal(true);
      expect(testClass.children_index[2].children_index[3].name).to.equal("three");

      done();
    });
  });

  describe("ApiFieldGenerator nested lazy loading", function() {
    it("ApiFieldGenerator.lazyLoadId()", function(done) {
      _.forIn({
        1: { id: 1, server: "server one",   child: 2 },
        2: { id: 2, server: "server two",   child: 3 },
        3: { id: 3, server: "server three", child: 1 }
      }, function(json, id) {
        $httpBackend.when('GET', '/api/test/'+id+'/').respond(200, json);
      });

      var TestClass = new JS.Class(TestBaseClass, {
        extend: {
          defaultOptions: _.extend({}, TestBaseClass.defaultOptions, { load: true })
        },
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadId(this, "child", TestClass);
        }
      });
      var testClass = TestClass.load({ id: 1 });
      expect(testClass.id).to.equal(1);
      expect(testClass.server).to.equal(undefined);
      expect(testClass.child).to.equal(null);
      expect(testClass.child_id).to.equal(null);

      $httpBackend.flush();
      $rootScope.$apply();

      setTimeout(function() {
        expect(testClass.id).to.equal(1);
        expect(testClass.server).to.equal("server one");
        expect(testClass.child_id).to.equal(2);
        expect(testClass.child).to.exist;
        expect(testClass.child.id).to.equal(2);
        expect(testClass.child.klass).to.equal(TestClass);
        expect(testClass.child.server).to.equal(undefined);

        $httpBackend.flush();
        $rootScope.$apply();

        setTimeout(function() {
          expect(testClass.child.id).to.equal(2);
          expect(testClass.child.server).to.equal("server two");
          expect(testClass.child.child).to.exist;
          expect(testClass.child.child.klass).to.equal(TestClass);
          expect(testClass.child.child_id).to.equal(3);
          expect(testClass.child.child.id).to.equal(3);
          expect(testClass.child.child.server).to.equal(undefined);

          $httpBackend.flush();
          $rootScope.$apply();

          setTimeout(function() {
            expect(testClass.child.child.server).to.equal("server three");
            expect(testClass.child.child.child).to.exist;
            expect(testClass.child.child.child_id).to.equal(1);
            expect(testClass.child.child.child.id).to.equal(1);
            expect(testClass.child.child.child.klass).to.equal(TestClass);

            // testClass.child.child.child should be already cached
            expect(testClass.child.child.child).to.equal(testClass); // cache logic broken
            done()
          })
        })
      })
    });

    it("ApiFieldGenerator.lazyLoadIdArray()", function(done) {
      _.forIn({
        1: { id: 1, server: "server one",   children: [2,3] },
        2: { id: 2, server: "server two",   children: [3] },
        3: { id: 3, server: "server three", children: [2,1] }
      }, function(json, id) {
        $httpBackend.when('GET', '/api/test/'+id+'/').respond(200, json);
      });

      var TestClass = new JS.Class(TestBaseClass, {
        extend: {
          defaultOptions: _.extend({}, TestBaseClass.defaultOptions, { load: true })
        },
        $initializeObjectProperties: function(data) {
          this.callSuper();
          this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "children", TestClass);
        }
      });
      var testClass = TestClass.load({ id: 1 });
      expect(testClass.id).to.equal(1);
      expect(testClass.server).to.equal(undefined);
      expect(testClass.children_ids).to.deep.equal([]);

      $httpBackend.flush();
      $rootScope.$apply();

      setTimeout(function() {
        expect(testClass.children_index[1]).to.not.exist;
        expect(testClass.children_index[2].id).to.equal(2);
        expect(testClass.children_index[3].id).to.equal(3);
        expect(testClass.children_index[2].children_ids).to.deep.equal([]);
        expect(testClass.children_index[3].children_ids).to.deep.equal([]);
        expect(testClass.children_index[2].klass).to.equal(TestClass);
        expect(testClass.children_index[3].klass).to.equal(TestClass);
        expect(testClass.children_index[2].server).to.equal(undefined);
        expect(testClass.children_index[3].server).to.equal(undefined);
        expect(testClass.children_index[2].$loaded).to.equal(false);
        expect(testClass.children_index[3].$loaded).to.equal(false);


        $httpBackend.flush();
        $rootScope.$apply();

        setTimeout(function() {
          expect(testClass.children_index[2].server).to.equal("server two");
          expect(testClass.children_index[3].server).to.equal("server three");
          expect(testClass.children_index[2].children_ids).to.deep.equal([3]);
          expect(testClass.children_index[3].children_ids).to.deep.equal([2,1]);

          // testClass.child.children.children should be already cached and form a loop
          expect(testClass.children_index[2].children_index[3]).to.deep.equal(testClass.children_index[3]);
          expect(testClass.children_index[3].children_index[2]).to.deep.equal(testClass.children_index[2]);
          expect(testClass.children_index[2].children_index[3]).to.deep.equal(TestClass.load(3));
          expect(testClass.children_index[3].children_index[2]).to.deep.equal(TestClass.load(2));
          expect(testClass.children_index[2].children_index[3].server).to.equal("server three");
          expect(testClass.children_index[3].children_index[2].server).to.equal("server two");
          expect(testClass.children_index[2].children_index[3].$loaded).to.equal(true);
          expect(testClass.children_index[3].children_index[2].$loaded).to.equal(true);

          // Fully recursive data structure
          expect(testClass.children_index[2].children_index[3].children_index[1].children_index[2].children_index[3].children_index[1]).to.equal(testClass);
          done()
        })
      })
    });

    _.each(['object', 'ApiBaseClass'], function(testObject) {
      context("ApiFieldGenerator.memoize() - " + testObject, function() {
        var memoized, object1, object2;
        beforeEach(function() {
          if( testObject === 'object' ) {
            object1 = {
              klass:     {},
              $$hashkey: "object1",
              counter:  0,
              memoized: ApiFieldGenerator.memoize(function() {
                return {
                  counter:   this.counter++,
                  arguments: arguments
                }
              })
            };
            object2 = {
              klass:     {},
              $$hashkey: "object2",
              counter:  100,
              memoized: object1.memoized
            };
          }
          if( testObject === 'ApiBaseClass' ) {
            var TestClass = new JS.Class("TestClass", TestBaseClass, {
              memoized: ApiFieldGenerator.memoize(function() {
                this.counter = this.counter || 0;
                return {
                  counter:   this.counter++,
                  arguments: arguments
                }
              })
            });
            object1 = TestClass.load(1);
            object2 = TestClass.load(2);
          }
        });
        it("null arguments should equal", function() {
          expect(object1.memoized()).to.equal(object1.memoized());
        });
        it("same single integer arguments should equal", function() {
          expect(object1.memoized(1)).to.equal(object1.memoized(1));
        });
        it("different single integer arguments should not equal", function() {
          expect(object1.memoized(1)).to.not.equal(object1.memoized(2));
        });
        it("same multiple integer arguments should equal", function() {
          expect(object1.memoized(1,2,3)).to.equal(object1.memoized(1,2,3));
        });
        it("same first arguments should equal if others exist", function() {
          expect(object1.memoized(1)).to.not.equal(object1.memoized(1,2,3));
        });
        it("different multiple integer arguments should equal", function() {
          expect(object1.memoized(3,2,1)).to.not.equal(object1.memoized(1,2,3));
        });
        it("same object arguments should equal", function() {
          expect(object1.memoized({ x: 1 }, { y: 2 })).to.equal(object1.memoized({ x: 1 }, { y: 2 }));
        });
        it("different object arguments should not equal", function() {
          expect(object1.memoized({ x: 1 }, { y: 2, z: 3 })).to.not.equal(object1.memoized({ x: 1 }, { y: 2 }));
        });
        it("different object this's arguments should not equal", function() {
          expect(object1.memoized({ x: 1 }, { y: 2 })).to.not.equal(object2.memoized({ x: 1 }, { y: 2 }));
        });

        if( testObject === 'ApiBaseClass' ) {
          it("calling $setData on ApiBaseClass should reset memoization", function() {
            var outputBefore1 = object1.memoized();
            var outputBefore2 = object2.memoized();
            object1.$setData({ x: 2 });
            var outputAfter1 = object1.memoized();
            var outputAfter2 = object2.memoized();

            expect(outputBefore1).to.not.equal(outputAfter1);

            expect(outputBefore1).to.not.equal(outputBefore2);
            expect(outputBefore2).to.equal(outputAfter2);
          });
        }
      })
    })
  });
});