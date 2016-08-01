// TODO: Better organize tests
describe('UnenumerablePrototype', function() {
  var $q, $injector, $rootScope;
  var UnenumerablePrototype, ChildClass, GrandChildClass, GrandGrandChildClass;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector             = _$injector_;
    UnenumerablePrototype = $injector.get('UnenumerablePrototype');
    ChildClass = new JS.Class("ChildClass", UnenumerablePrototype, {
      initialize: function(func) {
        this.callSuper();
        if( _.isFunction(func) ) {
          return func.call(this, 'initialize');
        }
      },
      other_method: function() {},
      extend: {
        property: true,
        method: function() {
          return true;
        }
      }
    });
    GrandChildClass = new JS.Class("GrandChildClass", ChildClass, {
      initialize: function(func) {
        this.callSuper();
        return this.other_method(func);
      },
      other_method: function(func) {
        this.callSuper();
        if( _.isFunction(func) ) {
          return func.call(this, 'other_method');
        }
      },
      // without callSuper() - not defined in ChildClass or UnenumerablePrototype
      third_method: function(func) {
        if( _.isFunction(func) ) {
          return func.call(this, 'third_method');
        }
      }
    });
    GrandGrandChildClass = new JS.Class("GrandGrandChildClass", GrandChildClass, {
      third_method: function(func) {
        this.callSuper();
        if( _.isFunction(func) ) {
          return func.call(this, 'third_method');
        }
      }
    })
  }));

  it("initial prototype should be unenumerable", function() {
    var child = new ChildClass();
    var keys = [];
    for( var key in child ) {
      keys.push(key);
    }
    expect(keys).to.deep.equal([]);
    expect(_.keys(child)).to.deep.equal([]);
  });

  it("callSuper() should be unenumerable", function() {
    var child = new ChildClass(function(methodName) {
      var keys = [];
      for( var key in this ) {
        keys.push(key);
      }
      expect(keys, methodName).to.deep.equal([]);
      expect(_.keys(this), methodName).to.deep.equal([]);
    });
  });
  it("GrandChildClass.other_method()::callSuper() should be unenumerable", function() {
    var child = new GrandChildClass(function(methodName) {
      var keys = [];
      for( var key in this ) {
        keys.push(key);
      }
      expect(keys, methodName).to.deep.equal([]);
      expect(_.keys(this), methodName).to.deep.equal([]);
    });
    child.other_method(function(methodName) {
      var keys = [];
      for( var key in this ) {
        keys.push(key);
      }
      expect(keys, methodName).to.deep.equal([]);
      expect(_.keys(this), methodName).to.deep.equal([]);
    });
    child.third_method(function(methodName) {
      // without callSuper
      var keys = [];
      for( var key in this ) {
        keys.push(key);
      }
      expect(keys, methodName).to.deep.equal([]);
      expect(_.keys(this), methodName).to.deep.equal([]);
    });
  });
  it("GrandGrandChildClass.third_method() not defined low in the tree", function() {
    var child = new GrandGrandChildClass();
    child.third_method(function(methodName) {
      var keys = [];
      for( var key in this ) {
        keys.push(key);
      }
      expect(keys, methodName).to.deep.equal([]);
      expect(_.keys(this), methodName).to.deep.equal([]);
    });
  });
});
