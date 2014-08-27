describe("Driver actions", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../dsl.js');
  });
  it("should load example temp sensor driver", function() {
    driver = new DSL();
    require('./temp-sensor.js');
    expect(driver).not.toHaveError();
  });
  it("should load example mois sensor driver", function() {
    driver = new DSL();
    require('./mois-sensor.js');
    expect(driver).not.toHaveError();
  });
  it("should load full example driver", function() {
    driver = new DSL();
    require('../example.js');
    expect(driver).not.toHaveError();
  });
});

