describe("Driver data handler", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should have data_handler()", function() {
    driver.data_handler(function(raw) {});
  });
  it("should provide data format", function() {
    driver.data_handler(function(raw) {});
  });
  it("can be chained", function() {
  });
  describe("data formats", function() {
    beforeEach(function() {
      driver.data_handler(function(raw) {});
    });
  });
});
