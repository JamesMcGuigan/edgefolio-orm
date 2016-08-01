describe('Models: ApiBaseClass: Child Classes', function() {

  var Edgefolio, ApiBaseClass;
  var $q, $injector, $rootScope, $httpBackend;
  var api_v3;

  // COPY/PASTE from src/models/util/Edgefolio.js - dynamic injection doesn't work outside of it() functions
  var classNames = [
    "ApiCache", "ApiFieldGenerator", "CallbackPromise", // not ApiBaseClass instances

    "ApiBaseClass",
    "User",
    "Company", "ManagementCompany", "InvestmentCompany", "ServiceProvider",
    "Fund", "ShareClass",
    "Person", "Manager", "Investor",
    "DateBucket", "TimeSeries",
    "DateBucketMapped", "DateBucketValue", "TimeSeriesValue",

    "ApiCollection",
    "Indexes", "Benchmarks", "Index",
    "FundGroups", "FundGroup"
  ];
  // Remove abstract classes or things that are not ApiBaseClass instances
  var childClasses = _.difference(classNames, [
    "ApiCache", "ApiFieldGenerator", "CallbackPromise",
    "ApiBaseClass",
    "Company",
    "Person",
    "DateBucket", "TimeSeries",
    "DateBucketMapped", "DateBucketValue", "TimeSeriesValue"
  ]);


  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector    = _$injector_;
    $q           = $injector.get('$q');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope   = $injector.get('$rootScope');
    ApiBaseClass = $injector.get('ApiBaseClass');
    Edgefolio    = $injector.get('Edgefolio');

    api_v3 = readJSON('tests/json/api/edgefolio-api-v3.json');
    for( var url in api_v3 ) {
      $httpBackend.when('GET', url).respond(200, api_v3[url]);
    }
  }));


  describe('Models: Child Classes should be defined', function() {
    _.each(childClasses, function(childClassName) {
      it(childClassName + " should be defined", function(done) {
        var ChildClass = $injector.get(childClassName);
        expect(ChildClass).to.exist;
        expect(ChildClass.displayName).to.equal(childClassName);
        if( ChildClass.idParam ) {
          expect(ChildClass.url).to.contain(':' + ChildClass.idParam);
          expect(ChildClass.getUrl({ id: 1 })).to.contain(1);
        }
        done()
      })
    });
  });


  describe('Models: Child Classes should .load()', function() {
    _.each(childClasses, function(childClassName) {
      it(childClassName + ".load()", function(done) {
        var ChildClass = $injector.get(childClassName);
        expect(ChildClass).to.exist;

        var indexUrl   = ChildClass.getIndexUrl();
        var id         = _.get(api_v3, [indexUrl, 'results[0].id']) || 0;

        if( id ) {
          var instance = ChildClass.load({ id: id })
          instance.$loadPromise.callback(function(instance_async) {
            expect(instance).to.equal(instance_async);
            expect(instance.id).to.equal(id);
            done();
          });
          $httpBackend.flush(); // $httpBackend.flush() causes promise chain to execute synchronously
        } else {
          var instance = ChildClass.load({ id: 1, load: false })
          instance.$loadPromise.callback(function() {
            expect(instance.id).to.equal(1);
            done();
          });
          instance.$loadPromise.resolve(instance);
        }
      })
    });
  });
});
