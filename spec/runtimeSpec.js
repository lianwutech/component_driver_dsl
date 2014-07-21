describe("runtime behaviour", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  beforeEach(function() {
    driver.data_processor(function(raw) {
      return {
        data: { x: parseInt(raw.substring(0,2), 16), y: parseInt(raw.substring(2,4), 16) },
        state: 'none'
      };
    })
    .data({
      "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" }
    }).state('none', '没有状态', []);
  });
  it("should return valid data and state", function() {
    var result = driver.process_data("CCFF");
    expect(result.data).toEqual({x: 204, y: 255});
    expect(result.state).toEqual("none");
    expect(result.error).toBeUndefined();
  });
  it("should translate action", function() {
    driver.action('move', '移动', function() {
      return '13FE';
    });
    var result = driver.translate_action('move');
    expect(result).toEqual('13FE');
  });
  it("should not translate nonexist action", function() {
    var result = driver.translate_action('move');
    expect(result).toBeUndefined();
  });
  it("should translate action with multiple arguments", function() {
    driver.action('set_threshold', '设置上下限', function(min, max) {
      return (min*0x100 + max).toString(16);
     })
    .parameter('min', 'param description', 'number', {min: 1, max: 100, step: 1})
    .parameter('max', 'param description', 'number', {min: 1, max: 100, step: 1});
    var result = driver.translate_action('set_threshold', {max: 90, min: 10});
    expect(result).toEqual('a5a');
  });
});

