// TODO: Better organize tests
describe('Models: CallbackPromise', function() {
  var $q, $injector, $rootScope;
  var CallbackPromise;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector       = _$injector_;
    $q              = $injector.get('$q');
    $rootScope      = $injector.get('$rootScope');
    CallbackPromise = $injector.get('CallbackPromise');
  }));

  it("CallbackPromise() should behave as a promise", function(done) {
    var promise = CallbackPromise();

    var sequence = "before load";
    promise
      .then(function(value) {
        expect(sequence).to.equal("before load");
        expect(value).to.equal("first value");

        sequence = "first then";
        return "second value"
      })
      .then(function(value) {
        expect(sequence).to.equal("first then");
        expect(value).to.equal("second value");

        sequence = "second then";
        return $q.reject("error"); //
      })
      .then(function(value) {
        expect(sequence).to.equal("skipped then");
      })
      ["catch"](function(error) {
        expect(sequence).to.equal("second then");
        expect(error).to.equal("error");

        sequence = "first catch";
        return "catch value";
      })
      .then(function(value) {
        expect(sequence).to.equal("first catch");
        expect(value).to.equal("catch value");

        sequence = "third then";
        done();
        return "third value";
      })
      // $q.defer().finally() not being triggered
      ['finally'](function(value) {
        expect(sequence).to.equal("third then");
        expect(value).to.equal("third value");

        sequence = "finally";
        done()
      })

    expect(sequence).to.equal("before load");
    promise.resolve("first value");
    $rootScope.$apply()
  });

  it("CallbackPromise().callback() should function synchronously and be chainable", function(done) {
    var promise = CallbackPromise();

    var sequence = "before load";
    promise
      .callback(function(value) {
        expect(sequence).to.equal("before load");
        expect(value).to.equal("callback value");

        sequence = "first callback";
      })
      .callback(function(value) {
        expect(sequence).to.equal("first callback");
        expect(value).to.equal("callback value");

        sequence = "second callback";
      })
      .then(function(value) {
        expect(sequence).to.equal("second callback");
        expect(value).to.equal("callback value");

        sequence = "first then";
        return "first then value"
      })
      .then(function(value) {
        expect(sequence).to.equal("first then");
        expect(value).to.equal("first then value");

        sequence = "second then";
        setTimeout(done)
      })

    expect(sequence).to.equal("before load");
    promise.resolve("callback value");
    expect(sequence).to.equal("second callback");
    $rootScope.$apply()
    expect(sequence).to.equal("second then");
  });

  it("CallbackPromise().errorCallback() should function synchronously and be chainable", function(done) {
    var promise = CallbackPromise();

    var sequence = "before load";
    promise
      .errorCallback(function(value) {
        expect(sequence).to.equal("before load");
        expect(value).to.equal("callback value");

        sequence = "first callback";
      })
      .errorCallback(function(value) {
        expect(sequence).to.equal("first callback");
        expect(value).to.equal("callback value");

        sequence = "second callback";
      })
      ["catch"](function(value) {
        expect(sequence).to.equal("second callback");
        expect(value).to.equal("callback value");

        sequence = "first then";
        return "first then value"
      })
      .then(function(value) {
        expect(sequence).to.equal("first then");
        expect(value).to.equal("first then value");

        sequence = "second then";
        setTimeout(done)
      })

    expect(sequence).to.equal("before load");
    promise.reject("callback value");
    expect(sequence).to.equal("second callback");
    $rootScope.$apply();
    expect(sequence).to.equal("second then");
  });

  it("CallbackPromise() should work with $q.all()", function(done) {
    var promises = [
      CallbackPromise(),
      CallbackPromise(),
      CallbackPromise()
    ];
    $q.all(promises).then(function(values) {
      expect(Array.isArray(values)).to.equal(true);
      expect(values.length).to.equal(3);
      expect(values[0]).to.equal("one");
      expect(values[1]).to.equal("two");
      expect(values[2]).to.equal("three");
      done();
    });
    promises[0].resolve("one");
    promises[1].resolve("two");
    promises[2].resolve("three");
    $rootScope.$apply();
  });

  it("$q.when().finally() should trigger | NOTE: $q.defer().promise.finally() works in browser debugger but broken in tests", function(done) {
    $q.when()["finally"](function() {
      done()
    });
    $rootScope.$apply();
  });

//  it("$q.defer().promise.finally() should trigger - works in browser debugger, broken in tests", function(done) {
//    var deferred = $q.defer();
//    deferred.promise["finally"](function(value) {
//      expect(value).to.equal("first value");
//      done()
//    });
//
//    $rootScope.$apply();
//    deferred.resolve("first value");
//  })
//
//  it("CallbackPromise().finally() should trigger - works in browser debugger, broken in tests", function(done) {
//    var promise = CallbackPromise();
//
//    promise["finally"](function(value) {
//      expect(value).to.equal("first value");
//      done()
//    });
//
//    promise.resolve("first value");
//    $rootScope.$apply()
//  })
});
