describe("Driver actions", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should load example driver", function() {
    require('./example.js');
    expect(driver).not.toHaveError();
  });
});

