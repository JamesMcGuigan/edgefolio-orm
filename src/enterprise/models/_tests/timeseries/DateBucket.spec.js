var $q, $injector;
var DateBucket, isomoment;
var json, date_bucket, expected;

_.each(["DateBucket", "DateBucketMapped", "TimeSeries"], function(DateBucketChildClassName) {
  context(DateBucketChildClassName, function() {
    beforeEach(module('edgefolio.models'));
    beforeEach(inject(function(_$injector_) {
      $injector  = _$injector_;
      $q         = $injector.get('$q');
      DateBucket = $injector.get(DateBucketChildClassName);
    }));
    beforeEach(function() {
      json = {
        // sorted data with nulls
        "time_series": {
          "2009-07-31T00:00:00.000Z": 1.64582,
          "2008-11-30T00:00:00.000Z": 0.38623,
          "2009-08-31T00:00:00.000Z": null,
          "2008-06-30T00:00:00.000Z": 0,
          "2009-06-30T00:00:00.000Z": -2.7581,
          "2009-01-31T00:00:00.000Z": null,
          "2009-10-31T00:00:00.000Z": 1.30532
        }
      };
      expected = {
        "time_series": {
          '2008-06-30T00:00:00.000Z': 0,
          '2008-07-31T00:00:00.000Z': null,
          '2008-08-31T00:00:00.000Z': null,
          '2008-09-30T00:00:00.000Z': null,
          '2008-10-31T00:00:00.000Z': null,
          '2008-11-30T00:00:00.000Z': 0.38623,
          '2008-12-31T00:00:00.000Z': null,
          '2009-01-31T00:00:00.000Z': null,
          '2009-02-28T00:00:00.000Z': null,
          '2009-03-31T00:00:00.000Z': null,
          '2009-04-30T00:00:00.000Z': null,
          '2009-05-31T00:00:00.000Z': null,
          '2009-06-30T00:00:00.000Z': -2.7581,
          '2009-07-31T00:00:00.000Z': 1.64582,
          '2009-08-31T00:00:00.000Z': null,
          '2009-09-30T00:00:00.000Z': null,
          '2009-10-31T00:00:00.000Z': 1.30532
        }
      };
      date_bucket = new DateBucket(json.time_series)
    });

    context(DateBucketChildClassName + " constructor", function() {
      it(DateBucketChildClassName + ".dateBucket()", function() {
        // Datejs/window.Date() BUG: expected '2009-07-30T23:00:00.000Z' to equal '2009-07-31T00:00:00.000Z'
        _.forEach(_.keys(expected.time_series), function(datestring) {
          expect( DateBucket.dateBucket(datestring).toString(),    'DateBucket.dateBucket('+datestring+').toString()'    ).to.equal( datestring );
          expect( DateBucket.dateBucket(datestring).toISOString(), 'DateBucket.dateBucket('+datestring+').toISOString()' ).to.equal( datestring );
        });
      });
    });

    context(DateBucketChildClassName + " keys/values", function() {

      it(DateBucketChildClassName + "[date]", function(done) {
        // DateBucketChildClasses may return an object, but return original value through toString()
        _.forIn(expected.time_series, function(value, key) {
          expect( String(date_bucket[key]), key ).to.equal( String(expected.time_series[key]) );
        });
        done();
      });

      it(DateBucketChildClassName + ".get(date)", function(done) {
        _.forIn(expected.time_series, function(value, key) {
          expect( String(date_bucket.get(key)), key ).to.equal( String(expected.time_series[key]) );
        });
        done();
      });

      it(DateBucketChildClassName + ".get(0) === null", function(done) {
        _.forIn(expected.time_series, function(value, key) {
          expect( date_bucket.get(0), moment(0) ).to.equal( null );
          expect( date_bucket.get(moment(0)), moment(0) ).to.equal( null );
        });
        done();
      });

      it(DateBucketChildClassName + ".get(date.subtract())", function(done) {
        _.forIn(expected.time_series, function(value, key) {
          expect( String(date_bucket.get( moment(key).subtract(1, 'day')) ), key+".subtract(1, 'day')" ).to.equal( String(expected.time_series[key]) );
          expect( String(date_bucket.get( moment(key).startOf('month'))   ), key+".startOf('month')"   ).to.equal( String(expected.time_series[key]) );
        });
        done();
      });

      it(DateBucketChildClassName + ".getKey()", function(done) {
        _.forIn(expected.time_series, function(value, key) {
          expect( typeof date_bucket.getKey( moment(key) ) ).to.equal( "string" );
          expect( date_bucket.getKey( moment(key).subtract(1, 'day')   ), key+".subtract(1, 'day')"   ).to.equal( key );
          expect( date_bucket.getKey( moment(key).startOf('month')     ), key+".startOf('month')"     ).to.equal( key );
          expect( date_bucket.getKey( moment(key).subtract(1, 'month') ), key+".subtract(1, 'month')" ).to.not.equal( key );
        });
        done();
      });

      it("for key in DateBucket", function(done) {
        var keys = [];
        for( var key in date_bucket ) {
          keys.push(key);
        }
        expect( keys ).to.deep.equal( _.keys(expected.time_series) );
        expect( keys ).to.deep.equal( _(expected.time_series).keys().sortBy().value() );
        done();
      });

      it("Object.keys(DateBucket())", function(done) {
        expect( Object.keys(date_bucket) ).to.deep.equal( _.keys(expected.time_series) );
        done();
      });

      it("_.keys(DateBucket())", function(done) {
        expect( _.keys(date_bucket) ).to.deep.equal( _.keys(expected.time_series) );
        done();
      });

      it(DateBucketChildClassName + "().keys()", function(done) {
        expect( date_bucket.keys() ).to.deep.equal( _.keys(expected.time_series) );
        done();
      });

      it(DateBucketChildClassName + "().dates()", function(done) {
        var keys    = date_bucket.keys();
        var moments = date_bucket.dates();

        expect( Array.isArray(keys)    );
        expect( Array.isArray(moments) );
        expect( moments.length ).to.equal( keys.length );

        _(0).range(keys).each(function(i) {
          expect( moments[i] instanceof moment ).to.equal(true);
          expect( moments[i].isSame( moment(keys[i]) ) ).to.equal(true);
        });
        done();
      });

      it("_.values(DateBucket())", function(done) {
        expect( _.values(date_bucket).map(String) ).to.deep.equal( _.values(expected.time_series).map(String) );
        done();
      });

      it(DateBucketChildClassName + "().values()", function(done) {
        expect( date_bucket.values().map(String) ).to.deep.equal( _.values(expected.time_series).map(String) );
        done();
      });

      it(DateBucketChildClassName + "().$start_datestring()", function(done) {
        expect( date_bucket.$start_datestring()).to.equal(     _(expected.time_series).keys().first() );
        expect( date_bucket.$start_datestring()).to.not.equal( _(expected.time_series).keys().last()  );
        done();
      });
      it(DateBucketChildClassName + "().$start_date()", function(done) {
        expect( date_bucket.$start_date().isSame( moment(_(expected.time_series).keys().first()) ) ).to.equal(true);
        expect( date_bucket.$start_date().isSame( moment(_(expected.time_series).keys().last())  ) ).to.equal(false);
        done();
      });
      it(DateBucketChildClassName + "().$end_datestring()", function(done) {
        expect( date_bucket.$end_datestring()).to.not.equal( _(expected.time_series).keys().first() );
        expect( date_bucket.$end_datestring()).to.equal(     _(expected.time_series).keys().last() );
        done();
      });
      it(DateBucketChildClassName + "().$end_date()", function(done) {
        expect( date_bucket.$end_date().isSame( moment(_(expected.time_series).keys().first())) ).to.equal(false);
        expect( date_bucket.$end_date().isSame( moment(_(expected.time_series).keys().last()) ) ).to.equal(true);
        done();
      });

      it(DateBucketChildClassName + "().toObject()", function(done) {
        // .toObject() should return an object literal of values, not child Mapping values
        expect( date_bucket.toObject() instanceof DateBucket ).to.equal( false );
        expect( date_bucket.toObject() ).to.not.equal( date_bucket );
        expect( date_bucket.toObject() ).to.deep.equal( expected.time_series );
        done();
      });

      it(DateBucketChildClassName + "().clone()", function(done) {
        var clone = date_bucket.clone();
        expect( clone instanceof DateBucket ).to.equal( true );
        _.forIn(date_bucket, function(value, key) {
          expect( String(clone[key]) ).to.equal( String(expected.time_series[key]) );
        })

        var date = _(json.time_series).first();
        clone._set(date, 99);
        expect( String(clone.get(date)) ).to.equal(String(99));
        expect( String(date_bucket.get(date)) ).to.not.equal(String(99));
        done();
      });

      it(DateBucketChildClassName + "().size()", function(done) {
        expect( date_bucket.size() ).to.deep.equal( _(expected.time_series).keys().size() );
        done();
      });

    });

    context(DateBucketChildClassName + "._set()", function() {
      it("when key exists", function(done) {
        var modified_date = _.keys(expected.time_series)[5];
        date_bucket._set(modified_date, 99);

        expect( _(date_bucket).keys().size() ).to.equal( _(expected.time_series).keys().size() );

        _.forIn(expected.time_series, function(value, key) {
          if( key === modified_date ) {
            expect( String(date_bucket[key]) ).to.equal( String(99) );
          } else {
            expect( String(date_bucket[key]), key ).to.equal( String(expected.time_series[key]) );
          }
        });
        done();
      });

      it("when key exists in bucket", function(done) {
        var modified_date = moment( _.keys(expected.time_series)[5] ).startOf('month');
        date_bucket._set(modified_date, 99);

        expect( _(date_bucket).keys().size() ).to.equal( _(expected.time_series).keys().size() );

        _.forIn(expected.time_series, function(value, key) {
          if( date_bucket.getKey(modified_date) === key ) {
            expect( String(date_bucket[key]) ).to.equal( String(99) );
          } else {
            expect( String(date_bucket[key]), key ).to.equal( String(expected.time_series[key]) );
          }
        });
        done();
      });

      it("when key doesn't exist", function(done) {
        var modified_date = moment( _(expected.time_series).keys().first() ).subtract(4, 'months');
        date_bucket._set(modified_date, 99);

        expect( _(date_bucket).keys().size() ).to.equal( _(expected.time_series).keys().size() + 4 );
        expect( String(date_bucket.get(modified_date.clone().add(0, 'month'))) ).to.equal( String(99) );
        expect( date_bucket.get(modified_date.clone().add(1, 'month')) ).to.equal( null );
        expect( date_bucket.get(modified_date.clone().add(2, 'month')) ).to.equal( null );
        expect( date_bucket.get(modified_date.clone().add(3, 'month')) ).to.equal( null );

        // all previous values should be the same
        _.forIn(expected.time_series, function(value, key) {
          expect( String(date_bucket[key]), key ).to.equal( String(expected.time_series[key]) );
        });

        expect( _.keys(date_bucket) ).to.deep.equal( _(date_bucket).keys().sortBy().value() );
        done();
      });

      it(DateBucketChildClassName + "()._setAllFromObject() - strip null tails", function(done) {
        date_bucket._setAllFromObject({
          '2010-01-01T00:00:00.000Z': null,
          '2009-07-31T00:00:00.000Z': 0,
          '2009-10-03T10:00:00.000Z': 1,
          '2009-12-07T00:00:00.000Z': 2,
          '2009-06-30T00:00:00.000Z': null
        });
        expect(date_bucket.toObject()).to.deep.equal({
          //'2009-06-30T00:00:00.000Z': null,
          '2009-07-31T00:00:00.000Z': 0,
          '2009-08-31T00:00:00.000Z': null,
          '2009-09-30T00:00:00.000Z': null,
          '2009-10-31T00:00:00.000Z': 1,
          '2009-11-30T00:00:00.000Z': null,
          '2009-12-31T00:00:00.000Z': 2,
          //'2010-01-31T00:00:00.000Z': null
        });
        expect(date_bucket.$start_datestring()).to.equal('2009-07-31T00:00:00.000Z');
        expect(date_bucket.$end_datestring()).to.equal('2009-12-31T00:00:00.000Z');
        expect(date_bucket.size()).to.equal(6);
        done();
      });
    });

    context(DateBucketChildClassName + ".mapValues()", function() {
      it("return new instance of " + DateBucketChildClassName, function() {
        expect( date_bucket            , 'date_bucket'            ).instanceof( DateBucket );
        expect( date_bucket.mapValues(), 'date_bucket.mapValues()').instanceof( DateBucket );
      });
      it("not modify original data structure", function() {
        var original_date_bucket = date_bucket;
        var original_time_series = date_bucket.toObject();
        var double_time_series = _.mapValues(_.clone(original_time_series), function(value, key) {
          return value && value * 2 || value;
        });
        var double_date_bucket = date_bucket.mapValues(function(value, key) {
          return value && value * 2 || value;
        });


        expect( double_date_bucket ).to.not.equal( date_bucket );
        expect( original_date_bucket.toObject(), 'date_bucket.toObject() === json.time_series'  ).to.deep.equal( original_time_series );
        expect( double_date_bucket.toObject(),   'double_date_bucket     === double_time_series').to.deep.equal( double_time_series );
      })
    });


    context(DateBucketChildClassName + ".klass", function() {
      it(DateBucketChildClassName + ".init() as clone", function(done) {
        var clone = DateBucket.init(date_bucket);
        expect( clone instanceof DateBucket ).to.equal( true );
        expect( clone.toObject() ).to.deep.equal( expected.time_series );

        var date = _(json.time_series).first();
        clone._set(date, 99 );
        expect( String(clone.get(date)) ).to.equal( String(99) );
        expect( String(date_bucket.get(date)) ).to.not.equal( String(99) );
        done();
      });

      it(DateBucketChildClassName + ".incrementDate()", function(done) {
        var datestring = '2010-01-31T00:00:00.000Z';
        var date       = moment(datestring);
        var new_date   = DateBucket.incrementDate(date);

        expect( date.toString() ).to.equal(datestring);
        expect( new_date.isSame( date.clone().add(1, 'month') ) ).to.equal(true);
        done();
      });

      it(DateBucketChildClassName + ".dateBucket()", function(done) {
        var datestring = '2010-01-31T00:00:00.000Z';
        var date       = moment(datestring);
        expect( DateBucket.dateBucket(null)       instanceof moment ).to.equal( true );
        expect( DateBucket.dateBucket(datestring) instanceof moment ).to.equal( true );
        expect( DateBucket.dateBucket(date)       instanceof moment ).to.equal( true );
        expect( DateBucket.dateBucket(date                            ).isSame( date ) ).to.equal( true );
        expect( DateBucket.dateBucket(date.clone().subtract(1, 'day') ).isSame( date ) ).to.equal( true );
        expect( DateBucket.dateBucket(date.clone().startOf('month')   ).isSame( date ) ).to.equal( true );
        expect( DateBucket.dateBucket(null).toString() ).to.equal( "Invalid date" );
        done();
      });

      context(DateBucketChildClassName + ".dateArray()", function() {
        var range, expected_range;
        beforeEach(function() {
          range = DateBucket.dateArray([
            '2010-01-01T00:00:00.000Z',
            '2009-07-31T00:00:00.000Z',
            '2009-10-03T10:00:00.000Z',
            '2009-12-07T00:00:00.000Z',
            '2009-06-30T00:00:00.000Z'
          ]);
          expected_range = [
            '2009-06-30T00:00:00.000Z',
            '2009-07-31T00:00:00.000Z',
            '2009-08-31T00:00:00.000Z',
            '2009-09-30T00:00:00.000Z',
            '2009-10-31T00:00:00.000Z',
            '2009-11-30T00:00:00.000Z',
            '2009-12-31T00:00:00.000Z',
            '2010-01-31T00:00:00.000Z'
          ];
        });
        it("return type array", function() {
          expect(Array.isArray(range)).to.equal(true);
        });
        it("return expected array", function() {
          expect( range.map(String)).to.deep.equal( expected_range );
          expect( range.length ).to.equal(expected_range.length);
          range.forEach(function(date, i) {
            expect( date instanceof moment ).to.equal(true);
          });
        });
        it("single valued entry", function() {
          range = DateBucket.dateArray([
            '2010-01-31T00:00:00.000Z'
          ]);
          expect( range.map(String)).to.deep.equal(['2010-01-31T00:00:00.000Z']);
        });
        it("single valued entry - with date bucket rounding", function() {
          range = DateBucket.dateArray([
            '2010-01-01T00:00:00.000Z'
          ]);
          expect( range.map(String)).to.deep.equal(['2010-01-31T00:00:00.000Z']);
        });
        it("empty input", function() {
          range = DateBucket.dateArray([]);
          expect( range.map(String)).to.deep.equal([]);
        });
        it("null input", function() {
          range = DateBucket.dateArray(null);
          expect( range.map(String)).to.deep.equal([]);
        });
        it("undefined input", function() {
          range = DateBucket.dateArray();
          expect( range.map(String)).to.deep.equal([]);
        })
      });

      it(DateBucketChildClassName + "().dateBucketObject() - strip null tails", function(done) {
        expect(
          DateBucket.dateBucketObject({
            '2010-01-01T00:00:00.000Z': null,
            '2009-07-31T00:00:00.000Z': 5,
            '2009-10-03T10:00:00.000Z': 1,
            '2009-10-04T10:00:00.000Z': 0,    // latest date in same bucket
            '2009-12-07T00:00:00.000Z': 0,    // latest non-null date in same bucket - null
            '2009-12-08T00:00:00.000Z': null, // latest date in same bucket - null
            '2009-06-30T00:00:00.000Z': null
          })
        ).to.deep.equal({
          //'2009-06-30T00:00:00.000Z': null,
          '2009-07-31T00:00:00.000Z': 5,
          '2009-08-31T00:00:00.000Z': null,
          '2009-09-30T00:00:00.000Z': null,
          '2009-10-31T00:00:00.000Z': 0,
          '2009-11-30T00:00:00.000Z': null,
          '2009-12-31T00:00:00.000Z': 0,
          //'2010-01-31T00:00:00.000Z': null
        });
        done();
      });

    });
  });
});
