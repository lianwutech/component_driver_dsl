describe("runtime behaviour", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  beforeEach(function() {
    driver.state('none', '没有状态', []);
    driver.data_processor(function(raw) {
      return {
        data: { x: parseInt(raw.substring(0,2), 16), y: parseInt(raw.substring(2,4), 16) },
        state: 'none'
      };
    })
    .return_data({
      "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" }
    });
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
    var result = driver.execute('move');
    expect(result).toEqual('13FE');
  });
});

