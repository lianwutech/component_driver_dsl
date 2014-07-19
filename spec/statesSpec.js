describe("states", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should add valid state", function() {
    driver.action('close', '打开阀门', function() { });
    driver.state('open', '打开状态').permit('close');
    expect(driver).toHaveState('open');
  });
  it("should not add state without name", function() {
    driver.state(' ', '打开状态');
    expect(driver).not.toHaveState(' ');
    expect(driver).toHaveError('Please call state(name, desc)');
  });
  it("should not add state with no description", function() {
    driver.state('open', ' ');
    expect(driver).not.toHaveState('open');
    expect(driver).toHaveError('Please call state(name, desc)');
  });
  it("should have at least one action", function() {
    driver.state('open', '打开状态');
    expect(driver).not.toHaveState('open');
    expect(driver).toHaveError("State 'open' has no permitted action");
  });
  describe("permit()", function() {
    it("should not add nonexist actions", function() {
      state = driver.state('open', '打开状态');
      state.permit('wtf?');
      expect(driver).not.toHaveState('open');
      expect(driver).toHaveError("State 'open': can't permit nonexist action 'wtf?'");
    });
    it("can add multiple actions", function() {
      state = driver.state('open', '打开状态');
      driver.action('close', '打开阀门', function() { });
      driver.action('explode', '让阀门爆炸', function() { });
      state.permit('close', 'explode');
      expect(driver).toHaveState('open');
    });
    it("can be chained", function() {
      state = driver.state('open', '打开状态');
      driver.action('close', '打开阀门', function() { });
      driver.action('explode', '让阀门爆炸', function() { });
      state.permit('close').permit('explode');
      expect(driver).toHaveState('open');
    });
  });
});
