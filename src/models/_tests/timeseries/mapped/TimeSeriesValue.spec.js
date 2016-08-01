context("TimeSeriesValue", function() {
  var $injector, $q;
  var TimeSeriesValue, timeSeriesValue;

  var parent = { name: "parent" };
  var date = "2009-07-31T00:00:00.000Z";

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector       = _$injector_;
    $q              = $injector.get('$q');
    TimeSeriesValue = $injector.get('TimeSeriesValue');
    timeSeriesValue = new TimeSeriesValue(123456789, date);
  }));

  context(".display", function() {
    it("same input output - no floating point rounding errors", function() {
      for( i = 0; i < 1000; i++ ) {
        timeSeriesValue.display = i/1000;
        expect(timeSeriesValue.display).to.equal(i/1000);
      }
    });
    it("set calc", function() {
      for( i = 0; i < 1000; i++ ) {
        timeSeriesValue.display = i;
        expect(timeSeriesValue.calc).to.equal(i/100);
      }
    });

    it("read calc", function() {
      for( i = 0; i < 1000; i++ ) {
        timeSeriesValue.calc = i/100;
        expect(timeSeriesValue.display).to.equal(i);
        expect(timeSeriesValue.calc).to.equal(i/100);
      }
    });
  });
})
