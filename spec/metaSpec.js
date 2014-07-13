describe("Driver meta data", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    delete require.cache['../lib/dsl.js']
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("set name field", function() {
    expect(driver).toHaveErrorOn('name');
    driver.name("驱动名称");
    expect(driver).toHaveField('name');
    expect(driver).not.toHaveErrorOn('name');
  });
});
