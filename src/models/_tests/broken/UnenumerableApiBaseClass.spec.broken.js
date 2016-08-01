/**
 * @broken
 */
describe('UnenumerableApiBaseClass - broken', function() {
  var $q, $injector, $rootScope;
  var UnenumerableApiBaseClass;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector                = _$injector_;
    UnenumerableApiBaseClass = $injector.get('UnenumerableApiBaseClass');
  }));
  it("UnenumerableApiBaseClass", function() {
    var instance = UnenumerableApiBaseClass.load();
    expect(_.keys(instance)).to.deep.equal([]);
  });
})


