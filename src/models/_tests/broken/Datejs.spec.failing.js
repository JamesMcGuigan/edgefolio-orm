describe('Datejs 1.0.0-rc3 - date-en-GB.js - for dateString: "2009-07-31T00:00:00.000Z"', function() {

  it('Datejs.parse().toISOString() - passes', function() {
    expect(Date.parse("2009-07-31T00:00:00.000Z").toISOString()).to.equal("2009-07-31T00:00:00.000Z");
  });
  it('Datejs.parse().toString("yyyy-MM-ddTHH:mm:ss.sssZ")) - fails', function() {
    // AssertionError: expected '2009-07-31T01:00:00.000Z' to equal '2009-07-31T00:00:00.000Z'
    expect(Date.parse("2009-07-31T00:00:00.000Z").toString("yyyy-MM-ddTHH:mm:ss.sssZ")).to.equal("2009-07-31T00:00:00.000Z");
  });


  it('Datejs.parse().set({ millisecond: 0, second: 0, minute: 0 }).toISOString() - passes', function() {
    expect(Date.parse("2009-07-31T00:00:00.000Z").set({ millisecond: 0, second: 0, minute: 0 }).toISOString()).to.equal("2009-07-31T00:00:00.000Z");
  });
  it('Datejs.parse().set({ millisecond: 0, second: 0, minute: 0 }).toString("yyyy-MM-ddTHH:mm:ss.sssZ")) - fails', function() {
    // AssertionError: expected '2009-07-31T01:00:00.000Z' to equal '2009-07-31T00:00:00.000Z'
    expect(Date.parse("2009-07-31T00:00:00.000Z").set({ millisecond: 0, second: 0, minute: 0 }).toString("yyyy-MM-ddTHH:mm:ss.sssZ")).to.equal("2009-07-31T00:00:00.000Z");
  });


  it('Datejs.parse().set({ hour: 0 }).toISOString() - fails', function() {
    // AssertionError: expected '2009-07-30T23:00:00.000Z' to equal '2009-07-31T00:00:00.000Z'
    expect(Date.parse("2009-07-31T00:00:00.000Z").set({ hour: 0 }).toISOString()).to.equal("2009-07-31T00:00:00.000Z");
  });
  it('Datejs.parse().set({ hour: 0 }).toString("yyyy-MM-ddTHH:mm:ss.sssZ")) - passes', function() {
    expect(Date.parse("2009-07-31T00:00:00.000Z").set({ hour: 0 }).toString("yyyy-MM-ddTHH:mm:ss.sssZ")).to.equal("2009-07-31T00:00:00.000Z");
  });


  it('Datejs.parse().clearTime().toISOString() - fails', function() {
    // AssertionError: expected '2009-07-30T23:00:00.000Z' to equal '2009-07-31T00:00:00.000Z'
    expect(Date.parse("2009-07-31T00:00:00.000Z").clearTime().toISOString()).to.equal("2009-07-31T00:00:00.000Z");
  });
  it('Datejs.parse().clearTime().toString() - passes', function() {
    expect(Date.parse("2009-07-31T00:00:00.000Z").clearTime().toString("yyyy-MM-ddTHH:mm:ss.sssZ")).to.equal("2009-07-31T00:00:00.000Z");
  });

});