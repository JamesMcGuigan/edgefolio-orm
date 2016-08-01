context("TimeSeries", function() {
  var $injector, $q;
  var TimeSeries;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector  = _$injector_;
    $q         = $injector.get('$q');
    TimeSeries = $injector.get('TimeSeries');
  }));

  context("TimeSeries.latest", function() {
    it("with valid start and end dates", function() {
      var timeSeries = new TimeSeries({
        "2008-11-30T00:00:00.000Z": 0.38623,
        "2009-07-31T00:00:00.000Z": 1.64582
      });
      expect(timeSeries.latest).to.equal(1.64582);
      expect(timeSeries.latest).to.equal(1.64582);
      expect(String(timeSeries.latest_date)).to.equal("2009-07-31T00:00:00.000Z");
      expect(String(timeSeries.latest_date)).to.equal("2009-07-31T00:00:00.000Z");
    });
    it("valid start and end dates - suplied in reverse order", function() {
      var timeSeries = new TimeSeries({
        "2009-07-31T00:00:00.000Z": 1.64582,
        "2008-11-30T00:00:00.000Z": 0.38623
      });
      expect(timeSeries.latest).to.equal(1.64582);
      expect(timeSeries.latest).to.equal(1.64582);
      expect(String(timeSeries.latest_date)).to.equal("2009-07-31T00:00:00.000Z");
      expect(String(timeSeries.latest_date)).to.equal("2009-07-31T00:00:00.000Z");
    });
    it("not cache between multiple instances", function() {
      var timeSeries = new TimeSeries({
        "2008-11-30T00:00:00.000Z": 0.38623,
        "2009-07-31T00:00:00.000Z": 1.64582
      });
      var timeSeries = new TimeSeries({
        "2009-07-31T00:00:00.000Z": 1.1,
        "2010-12-31T00:00:00.000Z": 0.3
      });
      expect(timeSeries.latest).to.equal(0.3);
      expect(String(timeSeries.latest_date)).to.equal("2010-12-31T00:00:00.000Z");

    });
    it("return latest non-null value", function() {
      var timeSeries = new TimeSeries({
        "2008-11-30T00:00:00.000Z": 0.38623,
        "2009-07-31T00:00:00.000Z": 1.64582,
        "2010-07-31T00:00:00.000Z": null
      });
      expect(timeSeries.latest).to.equal(1.64582);
      expect(String(timeSeries.latest_date)).to.equal("2009-07-31T00:00:00.000Z");
    });
    it("return null for fully null array", function() {
      var timeSeries = new TimeSeries({
        "2008-11-30T00:00:00.000Z": null,
        "2009-07-31T00:00:00.000Z": null,
        "2010-07-31T00:00:00.000Z": null
      });
      expect(timeSeries.latest).to.equal(null);
      expect(timeSeries.latest_date).to.equal(null);
    });
    it("return null for empty array", function() {
      var timeSeries = new TimeSeries();
      expect(timeSeries.latest).to.equal(null);
      expect(timeSeries.latest_date).to.equal(null);
    });
  });

  context("TimeSeries.subsetDateRange", function() {
    var timeSeries;
    beforeEach(function() {
      timeSeries = new TimeSeries({
        '2009-06-30T00:00:00.000Z': -2,
        '2009-07-31T00:00:00.000Z': -1,
        '2009-08-31T00:00:00.000Z': 0,
        '2009-09-30T00:00:00.000Z': 3,
        '2009-10-31T00:00:00.000Z': 4,
        '2009-11-30T00:00:00.000Z': 5,
        '2009-12-31T00:00:00.000Z': 6,
        '2010-01-31T00:00:00.000Z': 7
      });
    });
    it("extact date range", function() {
      var range = timeSeries.subsetDateRange(
        _(timeSeries).keys().first(),
        _(timeSeries).keys().last()
      );
      expect(range.toObject()).to.deep.equal(timeSeries.toObject());
    });
    it("extact date range - array syntax", function() {
      var range = timeSeries.subsetDateRange(
        _.keys(timeSeries)
      );
      expect(range.toObject()).to.deep.equal(timeSeries.toObject());
    });
    it("single date", function() {
      var range = timeSeries.subsetDateRange(
        '2009-06-30T00:00:00.000Z'
      );
      expect(range.toObject()).to.deep.equal({
        '2009-06-30T00:00:00.000Z': -2
      });
    });
    it("out of bounds - no results", function() {
      var range = timeSeries.subsetDateRange(
        '1970-06-30T00:00:00.000Z',
        '1970-06-30T00:00:00.000Z'
      );
      expect(range.toObject()).to.deep.equal({});
    });
    it("out of bounds - full results", function() {
      var range = timeSeries.subsetDateRange(
        '1970-06-30T00:00:00.000Z',
        '2222-06-30T00:00:00.000Z'
      );
      expect(range.toObject()).to.deep.equal(timeSeries.toObject());
    });
    it("subset", function() {
      var range = timeSeries.subsetDateRange(
        '2009-08-11T00:00:00.000Z',
        '2009-11-11T00:00:00.000Z'
      );
      expect(range.toObject()).to.deep.equal({
        '2009-08-31T00:00:00.000Z': 0,
        '2009-09-30T00:00:00.000Z': 3,
        '2009-10-31T00:00:00.000Z': 4
      });
    });

    it("clone TimeSeriesValue", function() {
      var range = timeSeries.subsetDateRange(
        '2009-08-31T00:00:00.000Z',
        '2009-09-30T00:00:00.000Z'
      );
      expect(_.values(range)).to.deep.equal([0, 3]);
      expect(range.get('2009-08-31T00:00:00.000Z')).to.equal(0);
      expect(timeSeries.get('2009-08-31T00:00:00.000Z')).to.equal(0);
      timeSeries._set('2009-08-31T00:00:00.000Z', -1);
      expect(range.get('2009-08-31T00:00:00.000Z')).to.equal(0);
      expect(timeSeries.get('2009-08-31T00:00:00.000Z')).to.equal(-1);
      expect(timeSeries.get('2009-08-31T00:00:00.000Z')).to.not.equal(range.get('2009-08-31T00:00:00.000Z'));
    });
  });
});
