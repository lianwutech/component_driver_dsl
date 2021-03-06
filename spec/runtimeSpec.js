describe("runtime behaviour", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    log = function(level, msg) { };
    spyOn(global, 'log');
    DSL = require('../dsl.js');
    driver = new DSL();
    devices_dict = {
      '3FDASFE': { device_name: 'ASDFASDF' },
      '1DDF34F': { device_name: 'dasfadsf' }
    };
  });
  beforeEach(function() {
    driver.data_processor(function(device_id, device_type, timestamp, raw_data) {
      return {
        data: { x: parseInt(raw_data.substring(0,2), 16), y: parseInt(raw_data.substring(2,4), 16) },
        state: 'none'
      };
    })
    .data({
      "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" }
    }).state('none', '没有状态', []);
  });
  it("should return valid data and state", function() {
    var result = driver.process_data("DEVICE_ID", 0, "2013-33-33", "CCFF");
    expect(result.data).toEqual({x: 204, y: 255});
    expect(result.state).toEqual("none");
    expect(result.error).toBeUndefined();
  });
  it("should catch js errors in data processor", function() {
    driver.data_processor(function(device_id, device_type, timestamp, raw_data) {
      throw new Error("fake error");
    });
    var result = driver.process_data("DEVICE_ID", 0, "2013-33-33", "CCFF");
    expect(global.log).toHaveBeenCalledWith(40, 'Error in process_data(DEVICE_ID, 0, 2013-33-33, CCFF): Error - fake error');
  });
  it("component should not be passive by default", function() {
    var result = driver.validate();
    expect(result.passive).toBe(false);
  });
  it("calling data_fetcher() should make component passive", function() {
    driver.data_fetcher(function() {
      return '48ED';
    });
    var result = driver.validate();
    expect(result.passive).toBe(true);
  });
  it("fetch_data() should retrieve data", function() {
    driver.data_fetcher(function() {
      return '48ED';
    });
    var result = driver.fetch_data();
    expect(result).toEqual([ { device_id : '3FDASFE', command : '48ED' }, { device_id : '1DDF34F', command : '48ED' } ]);
  });
  it("should catch js errors in data fetcher", function() {
    driver.data_fetcher(function() {
      throw new Error("fake error");
    });
    var result = driver.fetch_data();
    expect(global.log).toHaveBeenCalledWith(40, 'Error in fetch_data(): Error - fake error');
  });
  it("should translate action", function() {
    driver.action('move', '移动', function() {
      return '13FE';
    });
    var result = driver.translate_action('move');
    expect(result).toEqual([ { device_id : '3FDASFE', command : '13FE' }, { device_id : '1DDF34F', command : '13FE' } ]);
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
    expect(result).toEqual([ { device_id : '3FDASFE', command : 'a5a' }, { device_id : '1DDF34F', command : 'a5a' } ]);
  });
  it("should catch js errors when translate action", function() {
    driver.action('move', '移动', function() {
      throw new Error("fake error");
    });
    var result = driver.translate_action("move");
    expect(global.log).toHaveBeenCalledWith(40, 'Error in translate_action("move"): Error - fake error');
  });
  it("should process action result", function() {
    driver.action('set_threshold', '设置上下限', function(min, max) {
      return (min*0x100 + max).toString(16);
    })
    .parameter('min', 'param description', 'number', {min: 1, max: 100, step: 1})
    .parameter('max', 'param description', 'number', {min: 1, max: 100, step: 1});
    driver.action_result_processor(function(command, result) {
      return {
        result: "success",
        result_desc: ""
      };
    });
    var result = driver.translate_action('set_threshold', {max: 90, min: 10});
    expect(result).toEqual([ { device_id : '3FDASFE', command : 'a5a' }, { device_id : '1DDF34F', command : 'a5a' } ]);
    var result2 = driver.process_action_result({}, "SDFAF");
    expect(result2).toEqual( { result: "success", result_desc: "" });
  });
  it("should catch js errors when process action result", function() {
    driver.action_result_processor(function(command, result) {
      throw new Error("fake error");
    });
    driver.process_action_result({"command_id" : 1}, "SDFAF");
    expect(global.log).toHaveBeenCalledWith(40, 'Error: fake error');
  });
});

