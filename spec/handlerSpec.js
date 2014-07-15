describe("Driver actions", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should have data_handler()", function() {
    driver.data_handler(function(raw) {});
  });
  it("should have get_state()", function() {
    driver.get_state(function() {});
  });
  it("can be chained", function() {
    driver.data_handler(function(raw) {}).get_state(function() {});
  });
});
