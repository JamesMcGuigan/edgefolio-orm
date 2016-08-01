context("DateBucketValue", function() {
  var $injector, $q;
  var DateBucketValue;

  var parent = { name: "parent" };
  var date = "2009-07-31T00:00:00.000Z";

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector       = _$injector_;
    $q              = $injector.get('$q');
    DateBucketValue = $injector.get('DateBucketValue');
  }));
  context("constructor", function() {
    var dateBucketValue;
    beforeEach(inject(function(_$injector_) {
      dateBucketValue = new DateBucketValue(0, date, parent);
    }));
    it(".display", function() {
      expect(dateBucketValue.date).to.equal(date);
    });
    it(".value()", function() {
      expect(dateBucketValue.value()).to.equal(0);
    });
    it(".date", function() {
      expect(dateBucketValue.date).to.equal(date);
    });
    it(".moment", function() {
      expect(dateBucketValue.moment).instanceof(moment);
      expect(String(dateBucketValue.moment)).to.equal(date);
    });
    it(".moment should return same instance", function() {
      expect(dateBucketValue.moment).to.equal(dateBucketValue.moment);
    });
    it(".parent", function() {
      expect(dateBucketValue.parent).to.equal(parent);
    });
    it(".parent null", function() {
      dateBucketValue = new DateBucketValue(0, date);
      expect(dateBucketValue.parent).to.equal(null);
    });
  });
  context("klass.init", function() {
    it("valid value", function() {
      expect(DateBucketValue.init(0, date)).to.deep.equal(new DateBucketValue(0, date));
    });
    it("clone", function() {
      var dateBucketValue = DateBucketValue.init(0, date);
      expect(DateBucketValue.init(dateBucketValue)).to.deep.equal(new DateBucketValue(0, date));
      expect(DateBucketValue.init(dateBucketValue)).to.equal(dateBucketValue);
    });
    it("null", function() {
      expect(DateBucketValue.init(null, date)).to.equal(null);
    });
  });
})
