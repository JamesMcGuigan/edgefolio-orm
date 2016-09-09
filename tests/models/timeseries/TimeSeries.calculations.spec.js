context("TimeSeries", function() {
  var $injector, $q;
  var TimeSeries;

  beforeEach(module('edgefolio.models'));
  beforeEach(inject(function(_$injector_) {
    $injector  = _$injector_;
    $q         = $injector.get('$q');
    TimeSeries = $injector.get('TimeSeries');
  }));

  context("TimeSeries.klass", function() {
    context("TimeSeries.toCalc() + fromCalc()", function() {

      it("TimeSeries.toCalc", function() {
        var data = [
          { input: 2,          expected: 0.02     },
          { input: [2],        expected: [0.02]   },
          { input: {a:2},      expected: {a:0.02} },
          { input: null,       expected: null     },
          { input: NaN,        expected: null     },
          { input: undefined,  expected: null     }
        ];
        _.forIn(data, function(test) {
          expect( TimeSeries.toCalc(test.input), test ).to.deep.equal(test.expected);
        })
      });
      it("TimeSeries.toCalc - object", function() {
        var test = {
          input: {
            '2008-06-30T00:00:00.000Z': 10,
            '2008-07-31T00:00:00.000Z': 1
          },
          expected: {
            '2008-06-30T00:00:00.000Z': 0.1,
            '2008-07-31T00:00:00.000Z': 0.01
          }
        };
        expect( TimeSeries.toCalc(test.input), test ).to.deep.equal(test.expected);
      });
      it("TimeSeries.fromCalc", function() {
        var data = [
          { expected: 2,      input:    0.02     },
          { expected: [2],    input:    [0.02]   },
          { expected: {a:2},  input:    {a:0.02} },
          { expected: null,   input:    null     },
          { expected: null,   input:    NaN      },
          { input: NaN,       expected: null     },
          { input: undefined, expected: null     }
        ];
        _.forIn(data, function(test) {
          expect( TimeSeries.fromCalc(test.input), test ).to.deep.equal(test.expected);
        })
      });
      it("TimeSeries.fromCalc - object", function() {
        var test = {
          expected: {
            '2008-06-30T00:00:00.000Z': 10,
            '2008-07-31T00:00:00.000Z': 1
          },
          input: {
            '2008-06-30T00:00:00.000Z': 0.1,
            '2008-07-31T00:00:00.000Z': 0.01
          }
        };
        expect( TimeSeries.fromCalc(test.input), test ).to.deep.equal(test.expected);
      });

      it("inverse functions via loadash", function() {
        // The distribution of rounding errors is symmetric around zero and for N/100, the following ranges have errors:
        // (+-) 7, 14, 28, 29, 55-58, 109-116, 201-255 (~half), 402-511 (~third), 803-1023 (in triplets), 1601-2044 (~third), 3202-4095 (~quarter), 6401-8190 (~third)

        var range = _.range(-6, 6); // none of the numbers under 7 have rounding errors!
        expect( _(range).thru(TimeSeries.toCalc, TimeSeries).thru(TimeSeries.fromCalc, TimeSeries).value() ).to.deep.equal( range )
      })
    });


    context("TimeSeries.groupByDateObject()", function() {
      it("return array mapping for single entry", function() {
        var input = [
          { '2008-06-30T00:00:00.000Z': 0 }
        ];
        var expected = { '2008-06-30T00:00:00.000Z': [ 0 ] };
        expect( TimeSeries.groupByDateObject(input) ).to.deep.equal(expected);
      });
      it("array double for field match", function() {
        var input = [
          { '2008-06-30T00:00:00.000Z': 0 },
          { '2008-06-30T00:00:00.000Z': 1 }
        ];
        var expected = {
          '2008-06-30T00:00:00.000Z': [ 0, 1 ]
        };
        expect( TimeSeries.groupByDateObject(input) ).to.deep.equal(expected);
      });
      it("array double for field match - argument syntax", function() {
        var input1 = { '2008-06-30T00:00:00.000Z': 0 };
        var input2 = { '2008-06-30T00:00:00.000Z': 1 };
        var expected = {
          '2008-06-30T00:00:00.000Z': [ 0, 1 ]
        };
        expect( TimeSeries.groupByDateObject(input1, input2) ).to.deep.equal(expected);
      });
      it("mixed matching", function() {
        var input = [
          {
            '2008-06-30T00:00:00.000Z': 1,
            '2008-07-31T00:00:00.000Z': 0
          },
          {
            '2008-06-30T00:00:00.000Z': 1,
            '2008-07-31T00:00:00.000Z': null,
            '2008-08-30T00:00:00.000Z': -1
          }
        ];
        var expected = {
          '2008-06-30T00:00:00.000Z': [1,     1],
          '2008-07-31T00:00:00.000Z': [0,  null],
          '2008-08-30T00:00:00.000Z': [null, -1]
        };
        expect( TimeSeries.groupByDateObject(input) ).to.deep.equal(expected);
      });
    });


    context("TimeSeries.excess()", function() {
      it("return array differences", function() {
        var input1   = {
          '2008-06-30T00:00:00.000Z': 10,
          '2008-07-31T00:00:00.000Z': 1
        };
        var input2   = {
          '2008-06-30T00:00:00.000Z': 2,
          '2008-07-31T00:00:00.000Z': 2
        };
        var expected = {
          '2008-06-30T00:00:00.000Z': 8,
          '2008-07-31T00:00:00.000Z': -1
        };
        var options = { fund_returns: input1, benchmark_returns: input2 };
        expect(TimeSeries.excess(options)).to.deep.equal(expected);
      });
      it("return null if either value is null", function() {
        var input1   = {
          '2008-06-30T00:00:00.000Z': 10,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-31T00:00:00.000Z': 2
        };
        var input2   = {
          '2008-06-30T00:00:00.000Z': null,
          '2008-07-31T00:00:00.000Z': 2,
          '2008-08-31T00:00:00.000Z': 2
        };
        var expected = {
          '2008-06-30T00:00:00.000Z': null,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-31T00:00:00.000Z': 0
        };
        var options = { fund_returns: input1, benchmark_returns: input2 };
        expect( TimeSeries.excess(options) ).to.deep.equal(expected);
      });
      it("empty === {}", function() {
        var input1 = new TimeSeries();
        var input2 = new TimeSeries();
        var expected = {};
        var options = { fund_returns: input1, benchmark_returns: input2 };
        expect( TimeSeries.excess(options) ).to.deep.equal(expected);
      });
    });

    context("TimeSeries.mean()", function() {
      it("TimeSeries.mean()", function() {
        it("with values", function() {
          var input = new TimeSeries({
            '2008-06-30T00:00:00.000Z': 0,
            '2008-07-31T00:00:00.000Z': null,
            '2008-08-30T00:00:00.000Z': 7,
            '2008-09-31T00:00:00.000Z': -2,
            '2008-10-31T00:00:00.000Z': 0.5
          });
          var expected = (0 + 7 + -2 + 0.5) / 4;
          input = { fund_returns: input };
          expect( TimeSeries.mean(input) ).to.equal(expected);
        });
      });
      it("all null === 0", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': null,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': null,
          '2008-09-31T00:00:00.000Z': null,
          '2008-10-31T00:00:00.000Z': null
        });
        input = { fund_returns: input };
        expect( TimeSeries.mean(input) ).to.equal(0);
      });
      it("empty === 0", function() {
        var input = new TimeSeries();
        input = { fund_returns: input };
        expect( TimeSeries.mean(input) ).to.equal(0);
      });
    });

    context("TimeSeries.standard_deviation()", function() {
      it("with values", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': 7,
          '2008-09-31T00:00:00.000Z': -2,
          '2008-10-31T00:00:00.000Z': 0.5
        });
        input = { fund_returns: input };
        var expected = ss.sampleStandardDeviation([0, 7, -2, 0.5]);
        expect( TimeSeries.standard_deviation(input)    ).to.be.closeTo(expected, 0.00001);
        expect( TimeSeries.annualized_volatility(input) ).to.be.closeTo(expected * Math.sqrt(12), 0.00001);
      });
      it("all null === 0", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': null,
          '2008-07-31T00:00:00.000Z': null
        });
        input = { fund_returns: input };
        expect( TimeSeries.standard_deviation(input) ).to.equal(0);
        expect( TimeSeries.annualized_volatility(input) ).to.equal(0);
      });
      it("empty === 0", function() {
        var input = new TimeSeries();
        input = { fund_returns: input };
        expect( TimeSeries.standard_deviation(input) ).to.equal(0);
        expect( TimeSeries.annualized_volatility(input) ).to.equal(0);
      });
    });


    context("TimeSeries.downside_deviation()", function() {
      it("with margin === 0", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': 7,
          '2008-09-31T00:00:00.000Z': -2,
          '2008-10-31T00:00:00.000Z': 0.5
        });
        var doff   = 1;
        var margin = 0/100;
        input      = { fund_returns: input, margin: margin };
        var expected = ss.sampleStandardDeviation([ -2/100-margin ]) * 100; // mask excludes === 0
        expect( TimeSeries.downside_deviation(input) ).to.equal(0);          // single valued array
      });
      it("with margin === 0.25", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': 7,
          '2008-09-31T00:00:00.000Z': -2,
          '2008-10-31T00:00:00.000Z': 0.5
        });
        var margin = 0.25/100;
        input      = { fund_returns: input, margin: margin };
        var expected = ss.sampleStandardDeviation([ 0/100-margin, -2/100-margin ]) * 100;
        expect( TimeSeries.downside_deviation(input) ).to.be.closeTo(expected, 0.00001);
      });
      it("with margin === 1", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': 7,
          '2008-09-31T00:00:00.000Z': -2,
          '2008-10-31T00:00:00.000Z': 0.5
        });
        var margin = 1/100;
        input = { fund_returns: input, margin: margin };
        var expected = ss.sampleStandardDeviation([ 0/100-margin, -2/100-margin, 0.5/100-margin ]) * 100;
        expect( TimeSeries.downside_deviation(input) ).to.be.closeTo(expected, 0.00001);
      });
      it("with margin === -10", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-30T00:00:00.000Z': 7,
          '2008-09-31T00:00:00.000Z': -2,
          '2008-10-31T00:00:00.000Z': 0.5
        });
        var margin   = -10/100;
        input = { fund_returns: input, margin: margin };

        var expected = (ss.sampleStandardDeviation([]) || 0) * 100; // ss.sampleStandardDeviation([]) === NaN
        expect( TimeSeries.downside_deviation(input) ).to.be.closeTo(expected, 0.00001);
      });
      it("all null === 0", function() {
        var input = new TimeSeries({
          '2008-06-30T00:00:00.000Z': null,
          '2008-07-31T00:00:00.000Z': null
        });
        input = { fund_returns: input };
        expect( TimeSeries.standard_deviation(input) ).to.equal(0);
      });
      it("empty === 0", function() {
        var input = new TimeSeries();
        input = { fund_returns: input };
        expect( TimeSeries.standard_deviation(input) ).to.equal(0);
      });
    });
  });

  context("TimeSeries.correlation_coefficient()", function() {
    it("same input === 100%", function() {
      var input1 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 0,
        '2008-07-31T00:00:00.000Z': null,
        '2008-08-30T00:00:00.000Z': 7,
        '2008-09-31T00:00:00.000Z': -2,
        '2008-10-31T00:00:00.000Z': 0.5
      });
      var input2 = input1;

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.be.closeTo( 100, 0.00001 )
    });
    it("opposite input === -100%", function() {
      var input1 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 0,
        '2008-07-31T00:00:00.000Z': null,
        '2008-08-30T00:00:00.000Z': 7,
        '2008-09-31T00:00:00.000Z': -2,
        '2008-10-31T00:00:00.000Z': 0.5
      });
      var input2 = input1.mapValues(function(value, key) { return value && -value || value; });

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.be.closeTo( -100, 0.00001 )
    });

    it("ignore non-overlapping and null data points", function() {
      var input1 = new TimeSeries({
        '2008-05-31T00:00:00.000Z': 9,
        '2008-06-30T00:00:00.000Z': 1,
        '2008-07-31T00:00:00.000Z': 2,
        '2008-08-31T00:00:00.000Z': null
      });
      var input2 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 1,
        '2008-07-31T00:00:00.000Z': 2,
        '2008-08-31T00:00:00.000Z': 9
      });

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.be.closeTo( 100, 0.00001 )
    });

    it("intermediate values to be same as ss.sampleCorrelation()", function() {
      var input1 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 1,
        '2008-07-31T00:00:00.000Z': 2,
        '2008-08-31T00:00:00.000Z': 3
      });
      var input2 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 5,
        '2008-07-31T00:00:00.000Z': 1,
        '2008-08-31T00:00:00.000Z': 9
      });
      var expected = ss.sampleCorrelation([1,2,3],[5,1,9]) * 100;

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.be.closeTo( expected, 0.00001 );
    });

    it("all zeros in any column === NaN - ss.sampleCorrelation() spec/bug", function() {
      var input1 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 1,
        '2008-07-31T00:00:00.000Z': 2
      });
      var input2 = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 0,
        '2008-07-31T00:00:00.000Z': 0
      });

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.equal(null);
    });

    it("empty === null", function() {
      var input1 = new TimeSeries();
      var input2 = new TimeSeries();

      var options = { fund_returns: input1, benchmark_returns: input2 };
      expect( TimeSeries.correlation_coefficient(options) ).to.equal(null);
    });

  });

  context("TimeSeries.period_return()", function() {
    it("with values", function() {
      var input = new TimeSeries({
        '2008-06-30T00:00:00.000Z': 0,
        '2008-07-31T00:00:00.000Z': null,
        '2008-08-30T00:00:00.000Z': 7,
        '2008-09-31T00:00:00.000Z': -2,
        '2008-10-31T00:00:00.000Z': 0.5
      });
      input = { fund_returns: input };
      var expected = (1.07 * 0.98 * 1.005 - 1) * 100;
      expect( TimeSeries.period_return(input),                'TimeSeries.period_return(input)'               ).to.be.closeTo(expected, 0.00001);
      //expect( TimeSeries.annualized_compounded_return(input), 'TimeSeries.annualized_compounded_return(input)').to.be.closeTo(expected, 0.00001);
      //expect( TimeSeries.annualized_period_return(input), 'TimeSeries.annualized_period_return(input)').to.be.closeTo(expected, 0.00001);
    });
    it("all null === 0", function() {
      var input = new TimeSeries({
        '2008-06-30T00:00:00.000Z': null,
        '2008-07-31T00:00:00.000Z': null
      });
      input = { fund_returns: input };
      expect( TimeSeries.period_return(input),                'TimeSeries.period_return(input)'               ).to.equal(0);
      //expect( TimeSeries.annualized_compounded_return(input), 'TimeSeries.annualized_compounded_return(input)').to.equal(0);
      //expect( TimeSeries.annualized_period_return(input),     'TimeSeries.annualized_period_return(input)').to.equal(0);
    });
    it("empty === 0", function() {
      var input = new TimeSeries();
      input = { fund_returns: input };
      expect( TimeSeries.period_return(input),                'TimeSeries.period_return(input)'               ).to.equal(0);
      //expect( TimeSeries.annualized_compounded_return(input), 'TimeSeries.annualized_compounded_return(input)').to.equal(0);
      //expect( TimeSeries.annualized_period_return(input),     'TimeSeries.annualized_period_return(input)'    ).to.equal(0);
    });
  });

});
