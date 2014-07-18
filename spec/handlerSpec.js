describe("Driver data processor", function() {
  beforeEach(function() {
    jasmine.addMatchers(require('./matchers'));
    DSL = require('../lib/dsl.js');
    driver = new DSL();
  });
  it("should check if data_processor() called", function() {
    expect(driver).toHaveError("data_processor() not provided");
    driver.data_processor(function(raw) {});
    expect(driver).not.toHaveError("data_processor() not provided");
  });
  it("should return_data() or return_state(), or both", function() {
    var processor = driver.data_processor(function(raw) {});
    expect(processor).toHaveError("data_processor should return_data() or return_state(), or both");
  });
  it("should provide return data format", function() {
    var processor = driver.data_processor(function(raw) {});
    processor.return_data({
      "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" },
    });
    expect(processor).not.toHaveError();
    expect(processor.getResult().data_format).toBeTruthy();
    expect(processor.getResult().will_return_data).toBe(true);
  });
  it("can also return state", function() {
    var processor = driver.data_processor(function(raw) {});
    processor.return_state();
    expect(processor).not.toHaveError();
    expect(processor.getResult().will_return_state).toBe(true);
  });
  it("or both", function() {
    var processor = driver.data_processor(function(raw) {});
    processor.return_data({
      "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" },
    }).return_state();
    expect(processor).not.toHaveError();
    expect(processor.getResult().data_format).toBeTruthy();
    expect(processor.getResult().will_return_data).toBe(true);
    expect(processor.getResult().will_return_state).toBe(true);
  });
  describe("data format", function() {
    beforeEach(function() {
      processor = driver.data_processor(function(raw) {});
    });
    it("should allow number, string and boolean type", function() {
      processor.return_data({
        "speed": { "name": "速度", "type": "number", "decimals": 2, "unit": "km" },
        "direction": { "name": "方向", "type": "string" },
        "has_obstacle": { "name": "障碍物", "type": "boolean", "true": "有", "false": "没有"}
      });
      expect(processor).not.toHaveError();
    });
    it("should have name supplied", function() {
      processor.return_data({
        "speed" : { "type": "number" }
      });
      expect(processor).toHaveError("returned data 'speed' should have name");
    });
    it("should have type supplied", function() {
      processor.return_data({
        "speed": { "name": "速度" }
      });
      expect(processor).toHaveError("returned data 'speed' should have type");
    });
    it("should not allow other types", function() {
      processor.return_data({
        "speed": { "name": "速度", "type": "integer" }
      });
      expect(processor).toHaveError("allowed return data types are 'number', 'string' and 'boolean'");
    });
    describe("'number'", function() {
      it("should have unit", function() {
        processor.return_data({
          "speed" : { "name": "速度", "type": "number", "decimals": 2 }
        });
        expect(processor).toHaveError("data type 'number' should have unit");
      });
      it("decimals is optional but should be integer", function() {
        processor.return_data({
          "speed" : { "name": "速度", "type": "number", "decimals": "None", "unit": "km" }
        });
        expect(processor).toHaveError("decimals of data type 'number' should within range [0..9]");
      });
      it("decimals is optional but should in range [0..9]", function() {
        processor.return_data({
          "speed" : { "name": "速度", "type": "number", "decimals": "11", "unit": "km" }
        });
        expect(processor).toHaveError("decimals of data type 'number' should within range [0..9]");
      });
    });
    describe("'boolean'", function() {
      it("should have true and false value's meaning", function() {
        processor.return_data({
          "has_obstacle": { "name": "障碍物", "type": "boolean" }
        });
        expect(processor).toHaveError("should specify meaning for 'true' and 'false' of boolean type");
      });
    });
  });
  describe("runtime behaviour", function() {
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
  });
});
