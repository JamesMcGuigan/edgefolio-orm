describe("moment.js", function() {
  it("chai", function() {
    expect(false); // expect(false) is a passing test
    expect( moment().startOf('day') ).to.eql(     moment().startOf('day') );
    expect( moment().startOf('day') ).to.not.eql( moment().startOf('day').add(1, 'day') );
    expect( moment("2009-10-31T00:00:00.000Z") ).to.eql(     moment("2009-10-31T00:00:00.000Z") );
    expect( moment("2009-10-31T00:00:00.000Z") ).to.not.eql( moment("2009-01-31T00:00:00.000Z") );
    expect([ moment().startOf('day'), moment().startOf('day').add(1, 'day') ]).to.deep.eql([     moment().startOf('day'), moment().startOf('day').add(1, 'day') ]);
    expect([ moment().startOf('day'), moment().startOf('day').add(1, 'day') ]).to.not.deep.eql([ moment().startOf('day').add(1, 'day'), moment().startOf('day') ]);
  });
  
  it("moment().toString() = moment().toISOString()", function() {
    expect( moment().startOf('day').toString() ).to.equal( moment().startOf('day').toISOString() );

    var object = {};
    object[ moment().startOf('day').add(1, "day") ] = "tomorrow";
    object[ moment().startOf('day') ] = "today";
  });

  it("moment() as sortable object keys", function() {
    var object = {};
    object[ moment().startOf('day').add(1, "day") ] = "tomorrow";
    object[ moment().startOf('day').add(-1, "day") ] = "yesterday";
    object[ moment().startOf('day') ] = "today";

    expect( object[ moment().startOf('day').add(1, "day") ] ).to.equal("tomorrow");
    expect( object[ moment().startOf('day').add(-1, "day")] ).to.equal("yesterday");
    expect( object[ moment().startOf('day')               ] ).to.equal("today");

    expect( _(object).keys().sortBy().map(function(key) { return object[key]; }).value() ).to.deep.eql([ "yesterday", "today", "tomorrow" ]);
    expect( _(object).keys().sortBy().map(function(key) { return moment(key); }).map(function(key) { return object[key]; }).value() ).to.deep.eql([ "yesterday", "today", "tomorrow" ]);
  });
});