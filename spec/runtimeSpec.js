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
  it("should return valid data and state", function() {
    driver.action('move', '移动', function() {
      return '13FE';
    });
    var result = driver.translate_action('move');
    expect(result).toEqual('13FE');
  });
});

