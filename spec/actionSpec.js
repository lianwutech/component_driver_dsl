describe("Driver actions", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    delete require.cache['../lib/dsl.js']
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("add action to action list", function() {
    expect(driver).not.toHaveField('open');
    driver.action('open', '', function() {
    });
    expect(driver).not.toHaveAction('open');
  });
});
