# Edgefolio ORM Model Layer

A fully recursive, promised and lazy loading json object, 
representing a multi-endpoint REST API with foreign key support,
with timeseries financial calculations and extensive unit tests. 

**[tests/models/api/ApiClassLoading.spec.js](tests/models/api/ApiClassLoading.spec.js)**
```
it("should be possible to fully recurse through data model", function(done) {
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
```

## Installation and Tests

```
npm install 
bower install
karma start tests/karma.conf.js  --single-run --config
./bundle.sh
```

## Class Hierarchy

```
Edgefolio.ApiBaseClass
- Edgefolio.User
- Edgefolio.Company
- Edgefolio.ManagementCompany
- Edgefolio.InvestmentCompany
- Edgefolio.ServiceProvider
- Edgefolio.Fund
- Edgefolio.ShareClass
- Edgefolio.Person
- Edgefolio.Manager
- Edgefolio.Investor
- Edgefolio.Index
- Edgefolio.FundGroup

Edgefolio.ApiBaseClass
- Edgefolio.ApiCollection
-- Edgefolio.Indexes
-- Edgefolio.Benchmarks
-- Edgefolio.FundGroups

UnenumerablePrototype
- Edgefolio.DateBucket
-- Edgefolio.DateBucketMapped // @unused
-- Edgefolio.TimeSeries
```


## ApiBaseClass +  Fund

Each ApiBaseClass instance represents a single API endpoint, with lazy-load resolution of foreign key objects.

Edgefolio.Fund is one endpoint specific implementation of ApiBaseClass

[src/models/api/Fund.js](src/models/api/Fund.js)
```
angular.module('edgefolio.models').factory('Fund', function($q, ApiBaseClass, CountryCodes, LegalStructures, TimeSeries, Index, CurrencySymbolMap) {
 var Fund = new JS.Class('Fund', ApiBaseClass, {
   extend: {
     url:       "/api/funds/:fund_id/",
     idParam:   "fund_id",
     risk_free_index_id: 63304 // HARD-CODED: { id: 63304, "name": "BofAML US Treasury Bills 1 Yr TR USD" }
   },
   ...
 }
}
```

The ```Edgefolio.``` prefix permits access within angular HTML templates, but can be omitted if ```Fund``` has been explictly injected into an angular function.

A new fund object, representing ```https://edgefolio.com/api/funds/123/``` can be created in any the following ways:
```
var fund = new Edgefolio.Fund(123);                                   // (1)
var fund = Edgefolio.Fund.load(123);                                  // (2)
Edgefolio.Fund.load(123).$loadPromise.then(function(fund) { ... })    // (3)
Edgefolio.Fund.load(123).$preloadPromise.then(function(fund) { ... }) // (4)
$q.all([ Edgefolio.Fund.load(123).$loadPromise ]).then(function() {   // (5)
  var fund = Edgefolio.Fund.load(123);
})
```

1. Uses the javascript new keyword to run the class constructor, return an instance and stores the object in a local cache
2. ```Fund.load()``` is a class method that calls ```new Fund()``` internally and has nicer syntax
3. ```$loadPromise``` resolves once the asynchronous ajax request to ```/api/funds/123/``` has returned (or if the object was previously cached)
4. ```$preloadPromise``` resolves once data for all foreign keys (one level deep) has been asynchronous requested (eg management_company, share_classes, service_providers and managers)
5. ```$q.all()``` is compatible with ```$loadPromise```/```$preloadPromise``` ([CallbackPromise.js](src/models/util/CallbackPromise.js)) and can be used queue multiple asynchronous promises


ApiBaseClass objects implement the id singleton pattern. The first call to ```new Fund(123)```,
will create and return a new object in javascript memory ```Edgefolio.Fund.cache[123]```.
All subsequent calls, via any of the above methods, will return the same existing cached object.
Modifying this one object in javascript memory, will propagate changes to all other references/pointers in the codebase.

The returned fund object will initially contain no data other than ```fund.id```. but its creation will trigger an
asynchronous ajax request in the background that will update the object upon its return.

- In the HTML template layer, the angular scope $digest cycle will detect that the object has update and automatically rerender the HTML
- In the javascript layer, use of ```$loadPromise``` or ```$preloadPromise``` may be required to guarantee data has been loaded at a specific part of the code flow, thus avoiding race conditions or indeterminate behaviour

### ApiBaseClass Options

The constructor for ApiBaseClass can additionally take a config object:

**[src/models/api/ApiBaseClass.js](src/models/api/ApiBaseClass.js)**
```
/**
 *  Loads a new instance, either fetched from cache or newly created and added to cache
 *  ApiBaseClass.load(1) === new ApiBaseClass(1) === ApiBaseClass.cache[1] (if cached)
 *
 *  @param id      {Number|String|Object}  this.$options = this.klass.parseOptions(id, config)
 *  @param config  {?Object}               this.$options = this.klass.parseOptions(id, config)
 *
 *  @param config.id     {Number|String|function} ID to load
 *  @param config.data   {Object}  define new data for instance
 *  @param config.load   {Boolean} request cached http update for instance [default: true if config.data set]
 *  @param config.force  {Boolean} trigger uncached htto update for instance
 *  @param config.loaded {Boolean} trigger resolution of $loadPromise      [default: true if config.data set]
 *  @param config.silent {Boolean} disable console errors and warnings - for unit tests
 *  @constructor
 */
 initialize: function(id, config) {
   ...
 }
```

### $loadPromise + $preloadPromise = CallbackPromise 
 
CallbackPromise is a decorator around $q.defer() that looks and acts like a $q promise 
and is the implementation for ```ApiBaseClass.load().$loadPromise``` and ```ApiBaseClass.load().$preloadPromise```

```.callback()``` is executed synchronously after ```.resolve()```, whereas ```.then()``` as per the promise spec,
executes asynchronously in a new ```setTimeout()``` javascript thread. 


**[src/models/util/CallbackPromise.js](src/models/util/CallbackPromise.js)**
```
/**
 *  This a decorator around $q.defer() that looks and acts like a $q promise
 */
angular.module('edgefolio.models').factory("CallbackPromise", function($q) {
  function CallbackPromise(previousCallbackPromise) {
    this.init(previousCallbackPromise);
  }
  CallbackPromise.prototype = {
    klass:      CallbackPromise,
    init:       function(previousCallbackPromise) {},        

    // Instance variables
    deferred:   $q.defer(),
    status:     "unresolved", // "unresolved" | "success" | "error"
    value:      { "success": null, "error": null },
    callbacks:  { "success": [],   "error": [] },
    $$state:    this.deferred.promise.$$state,

    // Class methods
    then:          function(asyncFn) {}, // == this.deferred.promise.then(asyncFn)
    catch:         function(asyncFn) {}, // == this.deferred.promise.catch(asyncFn)
    finally:       function(asyncFn) {}, // == this.deferred.promise.finally(asyncFn)
    callback:      function(syncFn)  {}, // synchronous callback after .resolve()
    errorCallback: function(syncFn)  {}, // synchronous callback after .reject()
    resolve:    function(resolvedValue) {},
    reject:     function(resolvedValue) {},
    
    executeCallbacks: function() {},
  };
  return function() { return new CallbackPromise(); }
});
```


### ApiBaseClass Internals

While ApiBaseClass is designed to look and behave like a simple json object, there are several hidden methods and
implementation specific fields.

The raw json data from the api request ```https://edgefolio.com/api/funds/123/``` is stored in ```fund.$data = json```.

The default mapping for each field is ```ApiFieldGenerator.static()``` which creates a getter/setter virtual mapping on the root 
object via [```Object.defineProperty()```](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).
This default mapping can be overridden in child classes for specific fields. 

```ApiFieldGenerator``` contains a library of standard generator functions for common field mappings.

Most of the internal ApiBaseClass methods and fields are prefixed with a ```$```. 
This is to prevent namespace conflicts with the field names defined via api data.

The resultant data structure takes this general form:   
```
Edgefolio.Fund.load(123) = {
  id:    123, 
  $data: { name: 'Edgefolio Fund' },
  name:  {
    get: function()      { return this.data['name'];  },
    set: function(value) { this.data['name'] = value; }
  }
}
```



**[src/models/api/ApiBaseClass.js](src/models/api/ApiBaseClass.js)**
```
var ApiBaseClass = new JS.Class("ApiBaseClass", {
  uuid:         null,   // {String} 'Fund:1'   input to ApiBaseClass.loadUuid()
  $$hashKey:    null,   // {String} 'Fund:1:0' for Angular ng-repeat and ApiFieldGenerator.memoize()
  $options:     null,   // {Object} original options the instance was intialized with
  $dataVersion: null,   // {Number} internal version number, incremented on setData
  $data:        null,   // {Object} data as provided by the api
  $cache:       null,   // data cache for ApiFieldGenerator
  $fields:      null,   // ApiFieldGenerator: instance.$fields = { generatorName: { field: <Boolean> }}
  $loadPromise: null,   // <CallbackPromise>
  $loaded:      false,  // <Boolean> has $loadPromise been resolved

  initialize: function(id, config) {
    this.$options = this.klass.parseOptions(id, config);
    this.id       = this.$options.id; // overwritten by $initializeObjectProperties()
    ...
    this.$loaded      = !!this.$loaded; // instance paramters declared outside initialize do not seem to show
    this.$dataVersion = this.$dataVersion || 0;
    this.uuid         = [this.klass.displayName, this.id].join(':'); // 'Fund:1:0'
    this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':');
    this.$data        = {};
    this.$cache       = {};
    this.$fields      = {};
    this.$reload(_.extend({ force: false, load: true }, this.$options));
  }
})
```

Full initialization code flow: 
```fund.initialize()``` <br /> 
-> ```fund.$reload()``` -> ```fund.$setData(null)``` -> ```fund.$initializeObjectProperties()``` <br /> 
-> ```fund.$loadData()``` -> ```fund.$fetchData()``` -> ```$http.get('/api/funds/123/')``` <br />
-> ```fund.$setData()``` -> ```fund.$data = json``` -> ```fund.$initializeObjectProperties()``` <br />
-> ```ApiFieldGenerator.static()``` -> ```ApiFieldGenerator.defineProperty()``` -> ```Object.defineProperty()``` <br /> 
-> ```fund.$loadPromise.resolve(fund)``` -> ```fund.$loadPromise.then(function(fund) {})```


**[src/models/api/ApiBaseClass.js](src/models/api/ApiBaseClass.js)**
```
$setData: function(data) {
  if( !_.isObject(this.$data) ) {
    this.$data = {};
  }
  if( _.isObject(data) ) {
    // WARNING: this creates a pointer, rather than a clone - _.cloneDeep() is potentially expensive
    this.$dataVersion = this.$dataVersion + 1;
    this.$$hashKey    = [this.klass.displayName, this.id, this.$dataVersion].join(':'); // 'Fund:1:0'
    this.$data        = data;
  }
  this.$initializeObjectProperties();
  this.$trigger('$setData', this)
},
$initializeObjectProperties: function() {
  for( var field in this.$data ) {
    this.klass.ApiFieldGenerator['static'](this, field, this.$data);
  }
  this.klass.ApiFieldGenerator.aliasFunction(this, 'url', '$getUrl()');
},
```

**[src/models/util/ApiFieldGenerator.js](src/models/util/ApiFieldGenerator.js)**
```
/**
 *  Maps: instance[field] -> instance.$data[field]
 *
 *  NOTE: Object.defineProperty does introduce a 20x performance hit on read/write operations
 *        but speed should is still be acceptable (500 nanoseconds vs 25 nanoseconds)
 *        https://jsperf.com/property-access-with-defineproperty/3
 *
 * @param instance {object} ApiBaseClass::this
 * @param field    {string} name of field to define
 * @param data     {object} [optional | default: instance.$data] data object map
 */
'static': function(instance, field, data) {
  data = data || instance.$data;

  ApiFieldGenerator.defineProperty(instance, field, {
    enumerable:   true,  // expose in for( key in this ) loop
    configurable: true,  // allow property to be redefined later
    get: function()      { return data[field];  },
    set: function(value) { data[field] = value; }
  }, { generator: 'static', priority: false })
}
```
**[src/models/api/Fund.js](src/models/api/Fund.js)**
```
$initializeObjectProperties: function(data) {
  this.callSuper.apply(this, arguments);
  this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company",      "ManagementCompany");
  this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "share_classes",      "ShareClass");
  this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "service_providers",  "ServiceProvider");
  this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "managers",           "Manager");
  this.klass.ApiFieldGenerator.lookupOverwrite(this, "legal_structure",    LegalStructures);

  this.klass.ApiFieldGenerator.wrapClassOverwrite(this, "aum_time_series",      "TimeSeries");
  this.klass.ApiFieldGenerator.lazyLoadId(this,  "category_benchmark_index",    "Index");
  this.klass.ApiFieldGenerator.lazyLoadId(this,  "asset_class_benchmark_index", "Index");
  this.klass.ApiFieldGenerator.lazyLoadId(this,  "prospectus_benchmark_index",  "Index");

  this.klass.ApiFieldGenerator.lazyLoadId(this,  "risk_free_index",   "Index");
  //this.klass.ApiFieldGenerator.selfCaching(this, 'base_share_class', this.$base_share_class);

  // V2 API Mappings
  this.klass.ApiFieldGenerator.alias(this,       'latest_aum.amount',   'aum_time_series.latest',      'aum_time_series');
  this.klass.ApiFieldGenerator.alias(this,       'latest_aum.currency', 'aum_series_currency');
  this.klass.ApiFieldGenerator.alias(this,       'latest_aum.date',     'aum_time_series.latest_date', 'aum_time_series');
  this.klass.ApiFieldGenerator.lookupAlias(this, "latest_aum.symbol",   "aum_series_currency",         CurrencySymbolMap);

  this.klass.ApiFieldGenerator.lookupOverwrite(this, "domicile_country",      CountryCodes);
  this.klass.ApiFieldGenerator.lookupAlias(this,     "domicile_country_code", "domicile_country");

  this.klass.ApiFieldGenerator.objectAlias(this, "investors_breakdown", [
    "sovereign_wealth",
    "pension_funds",
    "foundations_and_endowments",
    "consultants",
    "family_offices",
    "funds_of_funds",
    "managed_account_platforms",
    "seeders_and_accelerators",
    "high_net_worth_individuals",
    "internal",
    "number_of_investors"
  ]);
},
```


### ApiBaseClass Foreign Keys

Foreign key support is implemented via ```ApiFieldGenerator.lazyLoadId()``` and ```ApiFieldGenerator.lazyLoadIdArray()``` 

The JSON API can define each foreign key as either a numeric id or the complete JSON representation of the child object   

**https://edgefolio.com/api/funds/123/**
```
{
  id: 123,
  management_company: 2,
  share_classes: [
    { id: 3, ... },
    { id: 4, ... },
  ],
  service_providers: [ 1, 2, 3 ],
  managers: [ 4, 5, 6 ],  
}
```

**[src/models/util/ApiFieldGenerator.js](src/models/util/ApiFieldGenerator.js)**
```
/**
 * Creates a single valued lazy load field
 *
 * Example:
 *   ApiFieldGenerator.lazyLoadId:(this, "fund", "Fund") {
 *   - maps: this["fund_id"] -> this.$data["fund"]
 *   - maps: this["fund"]    -> Fund.load({ id: this["fund_id"], options })
 *
 * @param instance  {object}          "this" within context of ApiBaseClass instance
 * @param field     {String}          name of the api field within this.$data
 * @param klass     {ApiBaseClass|String} klass to initialize, can be passed in as a string to avoid circular dependency injection
 */
lazyLoadId: function(instance, field, klass) {}
 
/**
 *  SPEC: Current view model is assumed to be read only, thus adding, removing or editing ids is not currently supported
 *
 *  instance.$data.funds:
 *   - instance.fund_ids   = [2,4,6]
 *   - instance.funds      = [Fund.load(2), Fund.load(4), Fund.load(6)]
 *   - instance.fund_index = {2: Fund.load(2), 4: Fund.load(4), 6: Fund.load(6) }
 */
lazyLoadIdArray: function(instance, field, klass) {}
```

**[src/models/api/Fund.js](src/models/api/Fund.js)**
```
$initializeObjectProperties: function(data) {
    this.callSuper.apply(this, arguments);
    this.klass.ApiFieldGenerator.lazyLoadId(this, "management_company",      "ManagementCompany");
    this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "share_classes",      "ShareClass");
    this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "service_providers",  "ServiceProvider");
    this.klass.ApiFieldGenerator.lazyLoadIdArray(this, "managers",           "Manager");
}
```

As a usage example, it is possible to start at any data point in the API, then recursively iterate through the various 
foreign key relationships and arrive back at the original ApiBaseClass object, which shares 
object identity (in javascript memory) with the beginning of the chain.  

**[tests/models/api/ApiClassLoading.spec.js](tests/models/api/ApiClassLoading.spec.js)**
```
it("should be possible to fully recurse through data model", function(done) {
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
```

Foreign key fields will be lazy-loaded on first access and data wrapped in an ApiBaseClass object, meaning
expressions will auto-resolve within the angular view layer. 
   
**[src/investor_app/views/groups/groups-graphs-menu.html](src/investor_app/views/groups/groups-graphs-menu.html)**
```
<li ng-if="Edgefolio.FundGroup.load($stateParams.fundgroup_id).funds.length === 0"/>
```

```$preloadPromise``` can be used to auto-resolve foreign-keys one-level deep 

**[src/common_components/v2/services/API/data/ApiDataService.js](src/common_components/v2/services/API/data/ApiDataService.js)**
```
getHedgeFundsForWatchlist: function(queryParams, cacheOptions) {
  return Edgefolio.FundGroup.load(queryParams, cacheOptions).$preloadPromise.then(function(watchlist) {
    return watchlist.funds;
  });
}
```





## ApiCollection + Benchmarks

Benchmarks is an instance of ApiCollection. 

**[src/models/collections/Benchmarks.js](src/models/collections/Benchmarks.js)**
```
/**
 * Benchmarks are currently implemented as the full set of available indexes
 */
angular.module("edgefolio.models").factory("Benchmarks", function(ApiCollection, Indexes, Index) {
  var Benchmarks = new JS.Class("Benchmarks", Indexes, {
    extend: {
      url:          "/api/indexes/",
      idParam:      null,
      resultsKlass: Index
    }
  });
  return Benchmarks;
});
```

It reuses the ApiBaseClass foreign key logic to map ```http://edgefolio.com/api/indexes/?page=X``` into: 
```
Edgefolio.Benchmarks.load() = {
  id: null,
  uuid: "Benchmarks:"
  $$hashKey: "Benchmarks::1",
  
  count: 3,
  $data: { results: [ {}, {}, {} ], count: 3 },
  $dataVersion: 1,
  $loaded: true,

  results:      [ Edgefolio.Index(), Edgefolio.Index(), Edgefolio.Index() ],
  result_ids:   [ 12, 15, 17 ],
  result_uuids: [ 'Index:12', 'Index:15', 'Index:17' ],
  result_index: {
    12: Edgefolio.Index(),
    15: Edgefolio.Index()
    17: Edgefolio.Index()
  }
}
```

## ApiBaseClass.$$hashKey

```ApiBaseClass().$$hashKey``` is unique for every ApiBaseClass instance and also updates on every change of api data.
This variable is the most efficient to use with ```$scope.$watch``` 


**[src/models/api/ApiBaseClass.js](src/models/api/ApiBaseClass.js)**
```
$setData: function(data) {
  this.$$hashKey = [this.klass.displayName, this.id, this.$dataVersion].join(':'); // 'Fund:1:0'
}
``` 

**[src/widgets/selectbox/selectbox.js](src/widgets/selectbox/selectbox.js)**
```
$scope.$watch(function() { return Edgefolio.Benchmarks.load().$$hashKey }, function() {
  Benchmarks.load().$preloadPromise.then(function(benchmarks) {
    $scope.items = _.get(benchmarks, 'results');
  });
});
```









## DateBucket + TimeSeries

#### JSON

```
var timestamp_indexed_object = {
  '2008-06-30T00:00:00.000Z': 0,
  '2008-07-31T00:00:00.000Z': null,
  '2008-08-30T00:00:00.000Z': 7,
  '2008-09-31T00:00:00.000Z': -2,
  '2008-10-31T00:00:00.000Z': 0.5
};
new TimeSeries(timestamp_indexed_object);
```

#### DateBucket

DateBucket is the parent class of TimeSeries and contains the low level logic manipulating a json timestamp_indexed_object.

Keys will each be date bucketed to the beginning of the last day in each month. If there are multiple values provided
within the same month date bucket, then the last non-null value will be chosen. If there are missing months, then
these will be inserted as null values. The keys in the object will be sorted.
Strips null heads and tails from both ends of timestamp_indexed_object

DateBucket extends UnenumerablePrototype, thus ```for(key in date_bucket)``` and ```_.keys(date_bucket)``` will only
return the timestamp keys and not any of the DateBucket/TimeSeries instance methods on the prototype chain.

**[tests/models/timeseries/DateBucket.spec.js](tests/models/timeseries/DateBucket.spec.js)**
```
it("for key in DateBucket", function(done) {
 var keys = [];
 for( var key in date_bucket ) {
   keys.push(key);
 }
 expect( keys ).to.deep.equal( _.keys(expected.time_series) );
 expect( keys ).to.deep.equal( _(expected.time_series).keys().sortBy().value() );
 done();
});
```

```
/**
 *  This is the base DateBucket for the v3 model framework
 *
 *  Assumes:
 *    src/common_components/global/date_toString.js - sets Date.prototype.toString = Date.prototype.toISOString (sortable)
 *
 *  DateBucketCache is kept outside the visible object tree, to avoid Inspectlet and other 3rd party libs from excess processing
 *
 *  NOTE: Strips null tails from both ends of timestamp_indexed_object
 *
 *  @documentation JS.Class: http://jsclass.jcoglan.com/
 *  @class DateBucket
 */
angular.module('edgefolio.models').factory('DateBucketCache', function() {
  return {
    getKey:        {},
    dateBucket:    {},
    incrementDate: {}
  };
});
angular.module('edgefolio.models').factory('DateBucket', function(
  _, $q, ApiBaseClass, ApiFieldGenerator, UnenumerablePrototype, DateBucketCache, moment
) {

  var DateBucket = new JS.Class("DateBucket", UnenumerablePrototype, {
    initialize: function(timestamp_indexed_object, options) {
      options = _.extend({
        prevalidated: false // @optimization: if true, don't run this.klass.dateBucketObject() on input
      }, options);

      if( options.prevalidated ) {
        this._setAllFromObjectPrevalidated(timestamp_indexed_object);
      } else {
        this._setAllFromObject(timestamp_indexed_object);
      }
    },

    // TimeSeries.latest_date needs to be self-caching to preserve object identity - preventing angular $digest loops
    $initializeObjectProperties: function() {
      ApiFieldGenerator.selfCaching(this, {
        "latest":           this.$latest,
        "latest_date":      this.$latest_date,
        "first":            this.$first,
        "first_date":       this.$first_date,
        "max_timeframe_id": this.$max_timeframe_id
      }, {
        enumerable:   false, // expose in for( key in instance ) loop
        configurable: false  // allow property to be redefined later
      });
    },
    has: function(date) {},
    getKey: function(date) {},
    get: function(date) {},
    _set: function(date, value) {},
    _setAllFromObject: function(timestamp_indexed_object) {},
    _setAllFromObjectPrevalidated: function(timestamp_indexed_object) {},
    keys: function() {},
    dates: function() {},
    values: function() {},
    size: function() {},
    toObject: function() {},
    clone: function() {},
    mapValues: function(callback, context) {},
    $latest: function() {},
    $latest_date: function() {},
    $first: function() {},
    $first_date: function() {},
    $max_timeframe_id: function() {},
    $start_datestring: function() {},
    $start_date: function() {},
    $end_datestring: function() {},
    $end_date: function() {},
    subsetDateRange: function( /* start_date, end_date */ ) {},
    _subsetDateRange: function(start_date, end_date) {},
    timeframe: function( input ) {},

    extend: {
      dateBucketSide: 'endOf', // endOf | startOf
      dateBucketSize: 'month', // year | quarter | month | week | day | hour | minute | second | millisecond

      resolve: function() {}, // Class initialization function
      init: function(timestamp_indexed_object, options) {},
      loadFromUuid: function(uuid, options) {},
      isValidValue: function(value) {},
      incrementDate: function(date) {},
      dateBucket: function(date) {},
      dateArray: function(date_array) {},
      dateBucketObject: function(timestamp_indexed_object) {},
      subsetDateRange: function(timestamp_indexed_object, start_date, end_date) {},
      timeframe: function(timestamp_indexed_object, months) {},
      toCalc: function(value) {},
      fromCalc: function(value) {},
      toCompounded: function(fund_returns, base_multiplier) {},
      thruCalcToNumber: function(fund_returns, callback, context) {},
      argumentsToFlattenedFilteredArray: function(args) {},
      groupByDate: function() {},
      groupByDateObject: function( /* array_of_returns */ ) {},
      _groupByDateObject: function(array_of_returns) {},
      groupByDateKeys: function( /* array_of_returns */ ) {},
      _groupByDateKeys: function(array_of_returns) {},
      invokeTimeframeOptions: function(options) {}
    }
  });
  return DateBucket;
});
```

#### TimeSeries

**[src/models/timeseries/TimeSeries.js](src/models/timeseries/TimeSeries.js)**
```
/**
 * Class based reimpleme ntation of /api/src/compute/measures/tasks.py
 */
angular.module('edgefolio.models').factory('TimeSeries', function(
  $q, kurtosis, covariance,
  Edgefolio, ApiFieldGenerator, DateBucket, AggregationDefinitions // NOTE: Injecting "Fund" causes a DI injection loop
) {
  var TimeSeries = new JS.Class("TimeSeries", DateBucket, {
    $initializeObjectProperties: function() {},

    $statistics: function(options) {},
    toCalc: function(options) {},
    fromCalc: function(options) {},
    groupByDateObject: function(options) {},

    excess: function(options) {},
    mean: function( options ) {},
    expected_return: function( options ) {},
    standard_deviation: function( options ) {},
    annualized_standard_deviation: function( options ) {},
    annualized_volatility: function( options ) {},
    downside_deviation: function( options ) {},
    skewness: function( options ) {},
    kurtosis: function( options ) {},
    period_return: function( options ) {},
    annualized_compounded_return: function( options ) {},
    annualized_period_return: function( options ) {},
    maximum_drawdown: function( options ) {},
    sharpe_ratio: function( options ) {},
    annualized_sharpe_ratio: function( options ) {},
    sortino_ratio: function( options ) {},
    annualized_sortino_ratio: function( options ) {},
    correlation_coefficient: function( options ) {},
    beta: function( options ) {},
    annualized_beta: function( options ) {},
    alpha: function( options ) {},
    annualized_alpha: function( options ) {},
    information_ratio: function( options ) {},

    //----- TimeSeries Klass Methods -----//
    extend: {
      statistics: function(options) {},
      excess: function(options) {},
      mean: function(options) {},
      expected_return: function(options) {},
      standard_deviation: function(options) {},
      annualized_standard_deviation: function(options) {},
      annualized_volatility: function(options) {},
      downside_deviation: function(options) {},
      skewness: function(options) {},
      kurtosis: function(options) {},
      period_return: function(options) {},
      annualized_compounded_return: function(options) {},
      annualized_period_return: function(options) {},
      maximum_drawdown: function(options) {},
      sharpe_ratio: function(options) {},
      annualized_sharpe_ratio: function(options) {},
      sortino_ratio: function(options) {},
      annualized_sortino_ratio: function(options) {},
      correlation_coefficient: function(options) {},
      beta: function(options) {},
      annualized_beta: function(options) {},
      alpha: function(options) {},
      annualized_alpha: function(options) {},
      information_ratio: function(options) {}
    }
  });
  return TimeSeries;
});
```

#### DateBucketMapped + DateBucketValue + TimeSeriesValue.js

This is unused (but tested) code permitting DateBucket to be used with object values rather than just numeric data.


## ApiFieldGenerator

ApiFieldGenerator contains a function generators that allow for consise specification of ApiBaseClass data mappings

**[src/models/util/ApiFieldGenerator.js](src/models/util/ApiFieldGenerator.js)**
```
/**
 *  Generator for Object.defineProperty()
 *  Performance Implications of Object.defineProperty(): https://www.nczonline.net/blog/2015/11/performance-implication-object-defineproperty/
 */
angular.module('edgefolio.models').factory('ApiFieldGenerator', function($injector) {
  var AFG, ApiFieldGenerator;
  AFG = ApiFieldGenerator = {
    klass: {
      unenumerableKlassPrototype: function(klass) {}
    },

    _call: function(context, functionOrValue, value) {},
    _getKlass: function(klass) {},
    _getId: function(value) {},
    _convertSelectorToArray: function(field) {},
    memoize: function(func) {},
    _memoizeCacheKey: function(item) {},

    defineProperty: function(instance, field, descriptor, options) {},
    _defineDeepProperty: function(instance, field, descriptor, options) {},
    _defineDeepProperties: function(instance, descriptorHash, options) {},
    defineGetters: function(instance, methodHash, _callback, descriptor) {},
    selfCaching: function(instance, methodHash, _callback, descriptor) {},

    static: function(instance, field, data) {},
    alias: function(instance, alias, field) {},
    aliasFunction: function(instance, alias, field, context) {},
    _resolveFunctionChain: function(instance, field, context) {},
    objectAlias: function(instance, alias, fields) {},
    unCamelCase: function(instance, field) {},
    join: function(instance, field, fields, seperator) {},
    lookupAlias: function(instance, alias, field, lookup) {},
    lookupOverwrite: function(instance, field, lookup) {},
    wrapClassReadOnly: function(instance, field, klass) {},
    wrapClassOverwrite: function(instance, field, klass) {},
    lazyLoadId: function(instance, field, klass) {},
    lazyLoadIdArray: function(instance, field, klass) {}
  };
  return ApiFieldGenerator;
});
```



# JS.Class

**[http://jsclass.jcoglan.com/](http://jsclass.jcoglan.com/)**

The cross-platform JavaScript class library

jsclass is a portable, modular JavaScript class library, influenced by the Ruby programming language.
It provides a rich set of tools for building object-oriented JavaScript programs,
and is designed to run on a wide variety of client- and server-side platforms.

TODO: JS.Class currently requires a manual compilation step, this should be integrated into the build chain

**[libs/vendor/jsclass/build-jsclass.sh](libs/vendor/jsclass/build-jsclass.sh)**
```
cd $(dirname "$0")/../../bower_components/jsclass/
npm install
npm run build
jsbuild --manifest build/src/loader-browser.js -r build/src/ \
    JS JS.Class JS.Class JS.Command JS.Command.Stack JS.Comparable JS.Console JS.ConstantScope JS.Decorator JS.Deferrable JS.DOM JS.Enumerable JS.Forwardable JS.Hash JS.HashSet JS.Interface JS.Kernel JS.Kernel JS.LinkedList JS.LinkedList.Doubly JS.LinkedList.Doubly.Circular JS.Method JS.MethodChain JS.Module JS.Observable JS.OrderedHash JS.OrderedSet JS.Proxy JS.Proxy.Virtual JS.Range JS.Set JS.Singleton JS.SortedSet JS.StackTrace JS.State JS.TSort \
    > ${THIS_DIR}/jsclass-all.js
```

# Includes

**[src/models/util/Edgefolio.js](src/models/util/Edgefolio.js)**
```
/**
 *  Convenience namespace for accessing model framework from console, or angular view templates
 */
angular.module('edgefolio.models').factory('Edgefolio', function() { return {} });
angular.module('edgefolio.models').run(function($injector, $rootScope, $window, Edgefolio, ApiFieldGenerator) {
  $window.Edgefolio    = Edgefolio;
  $rootScope.Edgefolio = Edgefolio;

  var classNames = [
    "ApiCache", "ApiFieldGenerator", "CallbackPromise",

    "ApiBaseClass",
    "User",
    "Company", "ManagementCompany", "InvestmentCompany", "ServiceProvider",
    "Fund", "ShareClass",
    "Person", "Manager", "Investor",
    "DateBucket", "TimeSeries",
    //"DateBucketMapped", "DateBucketValue", "TimeSeriesValue",

    "ApiCollection",
    "Indexes", "Benchmarks", "Index",
    "FundGroups", "FundGroup"
  ];
  for( var i in classNames ) {
    $rootScope[classNames[i]] = Edgefolio[classNames[i]] || ApiFieldGenerator._getKlass(classNames[i]);
  }
});
```


**[src/models/_models.module.js](src/models/_models.module.js)**
```
angular.module('edgefolio.models', [
  'edgefolio.constants'
]);

angular.module('edgefolio.models').value('_',          window._ );
angular.module('edgefolio.models').value('$',          window.$ );
angular.module('edgefolio.models').value('JS',         window.JS );
angular.module('edgefolio.models').value('moment',     window.moment);
angular.module('edgefolio.models').value('kurtosis',   require("compute-kurtosis"));
angular.module('edgefolio.models').value('covariance', require("compute-covariance"));

// Assumes presence of:
// - src/common_components/global/moment_toString.js:         moment.prototype.toString = moment.prototype.toISOString
// - src/common_components/global/array_simplestatistics.js:  array.prototype += ss.prototype[arrayFunctions]
```

**[src/models/_models.includes.conf](src/models/_models.includes.conf)**
```
src/production/browserify/compute-covariance.js
src/production/browserify/compute-kurtosis.js

libs/bower_components/lodash/lodash.js
libs/bower_components/jquery/dist/jquery.js                        # jQuery2 only supports IE9+, however so does angular
libs/bower_components/angular/angular.js                           # depends jquery
libs/bower_components/d3/d3.js
libs/vendor/jsclass/jsclass-all.js                                 # built via libs/vendor/jsclass/build-jsclass-all-js.sh
libs/bower_components/simple-statistics/dist/simple_statistics.js  # http:#simplestatistics.org/
libs/bower_components/moment/moment.js                             # New Date/Time Libary
libs/bower_components/moment-timezone/builds/moment-timezone-with-data.js
libs/bower_components/moment/locale/en-gb.js

src/_global/array_simplestatistics.js  # _.prototype = Array.prototype = ss[arrayMethods]
src/_global/moment_toString.js         # Date.toString = Date.toISOString | 2008-06-30T00:00:00.000Z format

src/common_components/angular/constants/_constants.includes.conf

src/models/_models.module.js
src/models/mixins/EventModule.js
src/models/util/CallbackPromise.js
src/models/util/ApiFieldGenerator.js
src/models/util/ApiCache.js
src/models/util/Edgefolio.js
src/models/util/UnenumerablePrototype.js
src/models/api/ApiBaseClass.js
src/models/api/Fund.js
src/models/api/Index.js
src/models/api/Person.js
src/models/api/ShareClass.js
src/models/api/User.js
src/models/api/Company.js
src/models/collections/ApiCollection.js
src/models/collections/Benchmarks.js
src/models/collections/FundGroups.js
src/models/timeseries/DateBucket.js
src/models/timeseries/TimeSeries.js
src/models/timeseries/mapped/DateBucketMapped.js
src/models/timeseries/mapped/DateBucketValue.js
src/models/timeseries/mapped/TimeSeriesValue.js
```

**[gulp/config.js](gulp/config.js)**
```
global.config = {
  browserify: {
    output_dir: "src/production/browserify/",
    modules:    [
      "compute-kurtosis",
      "compute-covariance"
    ]
  },
}
```
**src/production/browserify/***
```
src/production/browserify/compute-covariance.js
src/production/browserify/compute-kurtosis.js
```



## Tests

```
gulp test-unit
karma start tests/karma.conf.js --single-run
```

Output:
```
19 05 2016 13:04:02.736:INFO [karma]: Karma v0.13.22 server started at http://localhost:9876/
...
Finished in 9.291 secs / 1.033 secs

SUMMARY:
✔ 360 tests completed
```

**[tests/models/](tests/models/)**
```
├── api
│   ├── ApiBaseClass.klass.spec.js
│   ├── ApiClassLoading.spec.js
│   ├── ApiCollection.spec.js
│   ├── ChildClassModels.spec.js
│   └── Manager.spec.js
├── broken
│   ├── Datejs.spec.failing.js
│   └── UnenumerableApiBaseClass.spec.broken.js
├── libs
│   ├── ApiDataService.spec.js
│   └── moment.spec.js
├── mixins
│   └── EventModule.spec.js
├── timeseries
│   ├── DateBucket.spec.js
│   ├── TimeSeries.calculations.spec.js
│   ├── TimeSeries.spec.js
│   └── mapped
│       ├── DateBucketValue.spec.js
│       └── TimeSeriesValue.spec.js
└── util
    ├── ApiCache.spec.js
    ├── ApiFieldGenerator.spec.js
    ├── ApiFieldGenerator.wrapClass.spec.js
    ├── CallbackPromise.spec.js
    └── UnenumerablePrototype.spec.js
```
