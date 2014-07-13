describe("Driver meta data", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("pending", function() {
    //expect(false).toBe(true);
  });
});
