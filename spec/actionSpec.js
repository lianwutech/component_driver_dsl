describe("Driver actions", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should add action with valid name, desc and body", function() {
    expect(driver).not.toHaveAction('open');
    driver.action('open', '打开阀门', function() { });
    expect(driver).toHaveAction('open');
  });
  it("should not add action if lack of name, desc or body", function() {
    driver.action('open', '', function() { });
    expect(driver).not.toHaveAction('open');
    expect(driver).not.toHaveAction('open');
  });
  it("action name should be ", function() {
    driver.action('open', '', function() { });
    expect(driver).not.toHaveAction('open');
    expect(driver).not.toHaveAction('open');
  });
});
