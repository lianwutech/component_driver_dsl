describe("actions", function() {
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
  it("should not add action if lack of name", function() {
    driver.action(' ', 'desc', function() { });
    expect(driver).not.toHaveAction(' ');
    expect(driver).toHaveError("Please call action(name, desc, fn)");
  });
  it("should not add action if lack of description", function() {
    driver.action('open', ' ', function() { });
    expect(driver).not.toHaveAction('open');
    expect(driver).toHaveError("Please call action(name, desc, fn)");
  });
  it("should not add action if lack of function", function() {
    driver.action('open', 'desc', ' ');
    expect(driver).not.toHaveAction('open');
    expect(driver).toHaveError("Please call action(name, desc, fn)");
  });

  describe("parameter()", function() {
    beforeEach(function() {
      action = driver.action('open', 'action description', function(param) { });
    });
    it("should add valid parameter", function() {
      expect(action).not.toHaveParameter('param');
      action.parameter('param', 'param description', 'string');
      expect(action).not.toHaveError();
      expect(action).toHaveParameter('param');
    });
    it("should not add parameter if lack of description", function() {
      action.parameter('param', ' ', 'string');
      expect(action).not.toHaveParameter('param');
      expect(action).toHaveError("Please call parameter(name, desc, type, options)");
    });
    it("should not add parameter if lack of type", function() {
      action.parameter('param', 'param description', ' ');
      expect(action).not.toHaveParameter('param');
      expect(action).toHaveError("Please call parameter(name, desc, type, options)");
    });
    it("should not add parameter if type is unknown", function() {
      action.parameter('param', 'param description', 'unknown');
      expect(action).not.toHaveParameter('param');
      expect(action).toHaveError("Valid parameter type: 'string', 'number', 'enum'");
    });
    it("should match real function parameters", function() {
      action.parameter('fakeparam', 'param description', 'string');
      expect(action).not.toHaveParameter('fakeparam');
      expect(action).toHaveError("Action 'open' has no parameter 'fakeparam'");
    });
    it("should include all parameters", function() {
      expect(action).toHaveError("Parameter 'param' not defined for action 'open'");
    });
    it("can be chained", function() {
      action = driver.action('open', 'action description', function(param1, param2) { });
      action.parameter('param1', 'param description', 'string');
      action.parameter('param2', 'param description', 'string');
      expect(action).toHaveParameter('param1');
      expect(action).toHaveParameter('param2');
      expect(action).not.toHaveError();
    });
  });

  describe("parameter types", function() {
    beforeEach(function() {
      action = driver.action('open', 'action description', function(param) { });
    });
    describe("string", function() {
    });
    describe("number", function() {
      it("should pass if min, max and step is number", function() {
        action.parameter('param', 'param description', 'number', {min: 1, max: 100, step: 1});
        expect(action).toHaveParameter('param');
      });
      it("should fail if options not provided", function() {
        action.parameter('param', 'param description', 'number');
        expect(action).not.toHaveParameter('param');
        expect(action).toHaveError("Options 'min', 'max' and 'step' required for number parameter");
      });
      it("should fail if step is not number", function() {
        action.parameter('param', 'param description', 'number', {min: 1, max: 100, step: 'x'});
        expect(action).not.toHaveParameter('param');
        expect(action).toHaveError("Options 'min', 'max' and 'step' required for number parameter");
      });
    });
    describe("enum", function() {
      it("should pass if have valid items", function() {
        action.parameter('param', 'param description', 'enum', ['item1', 'item2']);
        expect(action).toHaveParameter('param');
      });
      it("should fail if no valid items provided", function() {
        action.parameter('param', 'param description', 'enum');
        expect(action).not.toHaveParameter('param');
        expect(action).toHaveError("Option 'enum' required for enum parameter");
      });
    });
  });

  describe("with no parameter", function() {
    beforeEach(function() {
      zero = driver.action('zero', 'zero', function() { });
    });
    it("should not add parameter", function() {
      zero.parameter('param', 'param');
      expect(zero).not.toHaveParameter('param');
      expect(driver).toHaveError("Action 'zero' has no parameter 'param'");
    });
  });

  it("should add valid action with all parameter definitions", function() {
    driver.action('set_threshold', '设置上下限', function(min, max) { })
    .parameter('min', 'param description', 'number', {min: 1, max: 100, step: 1})
    .parameter('max', 'param description', 'number', {min: 1, max: 100, step: 1});
    expect(driver).toHaveAction('set_threshold');
  });

  it("should not add action if lack of parameter list", function() {
    driver.action('set_threshold', '设置上下限', function(min, max) { });
    expect(driver).not.toHaveAction('set_threshold');
    expect(driver).toHaveError("Parameter 'min' not defined");
    expect(driver).toHaveError("Parameter 'max' not defined");
  });
});
