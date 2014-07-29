describe("states", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../dsl.js');
    driver = new DSL();
  });
  it("should add valid state", function() {
    driver.action('close', '打开阀门', function() { });
    driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state('open', '打开状态', ['close']);
    expect(driver).toHaveState('open');
  });
  it("should not add state without name", function() {
    driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state(' ', '打开状态');
   expect(driver).not.toHaveState(' ');
    expect(driver).toHaveError('Please call state(name, desc, permitted_actions)');
  });
  it("should not add state with no description", function() {
    driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state('open', ' ');
    expect(driver).not.toHaveState('open');
    expect(driver).toHaveError('Please call state(name, desc, permitted_actions)');
  });
  it("should have at least one action", function() {
    driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state('open', '打开状态');
    expect(driver).not.toHaveState('open');
    expect(driver).toHaveError('Please call state(name, desc, permitted_actions)');
  });
  describe("state actions", function() {
    it("should not add nonexist actions", function() {
      state = driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state('open', '打开状态', ['wtf?']);
      expect(driver).not.toHaveState('open');
      expect(driver).toHaveError("State 'open': can't permit nonexist action 'wtf?'");
    });
    it("can add multiple actions", function() {
      driver.action('close', '打开阀门', function() { });
      driver.action('explode', '让阀门爆炸', function() { });
      state = driver.data_processor(function(device_id, device_type, timestamp, raw_data){}).state('open', '打开状态', ['close', 'explode']);
      expect(driver).toHaveState('open');
    });
  });
});
