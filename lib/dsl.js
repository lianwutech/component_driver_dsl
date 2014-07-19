var ARGUMENT_NAMES, Action, ComponentDriverDSL, RawDataProcessor, STRIP_COMMENTS, State, driver, getParamNames, typeIsArray,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

ARGUMENT_NAMES = /([^\s,]+)/g;

getParamNames = function(func) {
  var fnStr, result;
  fnStr = func.toString().replace(STRIP_COMMENTS, '');
  result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result == null) {
    result = [];
  }
  return result;
};

typeIsArray = Array.isArray || function(value) {
  return {}.toString.call(value) === '[object Array]';
};

Action = (function() {
  function Action(name, desc, fn) {
    this.name = name;
    this.desc = desc;
    this.fn = fn;
    this.errors = [];
    this.parameters = {};
    this.parameter_names = getParamNames(this.fn);
  }

  Action.prototype.parameter = function(name, desc, type, options) {
    var checkType;
    checkType = (function(_this) {
      return function() {
        switch (type) {
          case 'string':
            return true;
          case 'number':
            if ((options != null) && typeof options['min'] === 'number' && typeof options['max'] === 'number' && typeof options['step'] === 'number') {
              return true;
            }
            _this.errors.push("Options 'min', 'max' and 'step' required for number parameter");
            return false;
          case 'enum':
            if ((options != null) && typeIsArray(options) && options.length > 0) {
              return true;
            }
            _this.errors.push("Option 'enum' required for enum parameter");
            return false;
          default:
            _this.errors.push("Valid parameter type: 'string', 'number', 'enum'");
            return false;
        }
      };
    })(this);
    if (__indexOf.call(this.parameter_names, name) < 0) {
      this.errors.push("Action '" + this.name + "' has no parameter '" + name + "'");
    } else if ((desc == null) || desc.trim() === '') {
      this.errors.push("Please call parameter(name, desc, type, options)");
    } else if ((type == null) || type.trim() === '') {
      this.errors.push("Please call parameter(name, desc, type, options)");
    } else if (checkType()) {
      this.parameters[name] = {
        desc: desc,
        type: type,
        options: options
      };
    }
    return this;
  };

  Action.prototype.validate = function() {
    var all_errors, name, _i, _len, _ref;
    all_errors = [].concat(this.errors);
    _ref = this.parameter_names;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      if (this.parameters[name] == null) {
        all_errors.push("Parameter '" + name + "' not defined for action '" + this.name + "'");
      }
    }
    return {
      parameters: this.parameters,
      errors: all_errors
    };
  };

  return Action;

})();

State = (function() {
  function State() {
    this.permitted_actions = [];
  }

  State.prototype.permit = function() {
    var action, _i, _len;
    for (_i = 0, _len = arguments.length; _i < _len; _i++) {
      action = arguments[_i];
      this.permitted_actions.push(action);
    }
    return this;
  };

  return State;

})();

RawDataProcessor = (function() {
  function RawDataProcessor(fn) {
    this.fn = fn;
  }

  RawDataProcessor.prototype.process = function(raw_data) {
    return this.fn(raw_data);
  };

  RawDataProcessor.prototype.data = function(data_format) {
    this.data_format = data_format;
    this.will_return_data = true;
    return this;
  };

  RawDataProcessor.prototype.state = function() {
    this.will_return_state = true;
    return this;
  };

  RawDataProcessor.prototype.validate = function() {
    var checkType, errors, item, key, retval, _ref;
    errors = [];
    retval = {};
    checkType = (function(_this) {
      return function(item) {
        var _ref;
        switch (item.type) {
          case "number":
            if (typeof item.unit !== 'string' || item.unit.trim().length === 0) {
              return errors.push("data type 'number' should have unit");
            } else {
              if (item.decimals == null) {
                item.decimals = 0;
              }
              if (typeof item.decimals !== 'number' || item.decimals % 1 !== 0 || !((0 <= (_ref = item.decimals) && _ref <= 9))) {
                return errors.push("decimals of data type 'number' should within range [0..9]");
              }
            }
            break;
          case "boolean":
            if (typeof item["true"] !== 'string' || item["true"].trim().length === 0 || typeof item["false"] !== 'string' || item["false"].trim().length === 0) {
              return errors.push("should specify meaning for 'true' and 'false' of boolean type");
            }
            break;
          case "string":
            return null;
          default:
            return errors.push("allowed return data types are 'number', 'string' and 'boolean'");
        }
      };
    })(this);
    if (!this.will_return_data && !this.will_return_state) {
      errors.push("data_processor should data() or state(), or both");
    } else {
      if (this.will_return_data) {
        retval.will_return_data = true;
        retval.data_format = this.data_format;
      }
      _ref = this.data_format;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        item = _ref[key];
        if (typeof item.name !== 'string' || item.name.trim().length === 0) {
          errors.push("returned data '" + key + "' should have name");
        } else if (typeof item.type !== 'string' || item.type.trim().length === 0) {
          errors.push("returned data '" + key + "' should have type");
        } else {
          checkType(item);
        }
      }
      retval.will_return_state = !!this.will_return_state;
    }
    retval.errors = errors;
    return retval;
  };

  return RawDataProcessor;

})();

ComponentDriverDSL = (function() {
  var required_fields;

  required_fields = ['name', 'version', 'desc', 'author', 'email'];

  function ComponentDriverDSL() {
    var field, _i, _len;
    this.field_given = {};
    for (_i = 0, _len = required_fields.length; _i < _len; _i++) {
      field = required_fields[_i];
      this.field_given[field] = false;
    }
    this.fields = {};
    this.actions = {};
    this.states = {};
    this.errors = [];
  }

  ComponentDriverDSL.prototype.addError = function(msg) {
    return this.errors.push(msg);
  };

  ComponentDriverDSL.prototype.name = function(str) {
    this.field_given.name = true;
    this.fields.name = str;
    return this;
  };

  ComponentDriverDSL.prototype.desc = function(str) {
    this.field_given.desc = true;
    this.fields.desc = str;
    return this;
  };

  ComponentDriverDSL.prototype.version = function(str) {
    var FORMAT;
    this.field_given.version = true;
    FORMAT = /^\d\.\d\.\d$/;
    if (str.match(FORMAT)) {
      this.fields.version = str;
    } else {
      this.addError('Driver version is malformed');
    }
    return this;
  };

  ComponentDriverDSL.prototype.author = function(str) {
    this.field_given.author = true;
    this.fields.author = str;
    return this;
  };

  ComponentDriverDSL.prototype.email = function(str) {
    var FORMAT;
    this.field_given.email = true;
    FORMAT = /[\w\.]+@[\w]+\.[a-zA-Z]+/;
    if (str.match(FORMAT)) {
      this.fields.email = str;
    } else {
      this.addError('Driver email is malformed');
    }
    return this;
  };

  ComponentDriverDSL.prototype.action = function(name, desc, fn) {
    if (typeof name !== 'string' || name.trim().length === 0 || typeof desc !== 'string' || desc.trim().length === 0 || typeof fn !== 'function') {
      return this.addError("Please call action(name, desc, fn)");
    } else {
      return this.actions[name] = new Action(name, desc, fn);
    }
  };

  ComponentDriverDSL.prototype.state = function(name, desc) {
    if (typeof name !== 'string' || name.trim().length === 0 || typeof desc !== 'string' || desc.trim().length === 0) {
      return this.addError("Please call state(name, desc)");
    } else {
      return this.states[name] = new State(name, desc);
    }
  };

  ComponentDriverDSL.prototype.translate_action = function() {
    var name, parameters;
    name = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.actions[name].fn(parameters);
  };

  ComponentDriverDSL.prototype.data_processor = function(fn) {
    return this.raw_data_processor = new RawDataProcessor(fn);
  };

  ComponentDriverDSL.prototype.validate = function() {
    var action, all_errors, field, given, isValidState, name, processor, retval, state, valid_actions, valid_states, _ref, _ref1, _ref2;
    all_errors = [].concat(this.errors);
    valid_actions = {};
    valid_states = {};
    _ref = this.field_given;
    for (field in _ref) {
      if (!__hasProp.call(_ref, field)) continue;
      given = _ref[field];
      if (!given) {
        all_errors.push("Driver " + field + "() is required");
      }
    }
    _ref1 = this.actions;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      action = _ref1[name];
      action = action.validate();
      if (action.errors.length > 0) {
        all_errors = all_errors.concat(action.errors);
      } else {
        valid_actions[name] = action;
      }
    }
    isValidState = (function(_this) {
      return function(name, state) {
        var _i, _len, _ref2;
        if (state.permitted_actions.length === 0) {
          all_errors.push("State '" + name + "' has no permitted action");
          return false;
        } else {
          _ref2 = state.permitted_actions;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            action = _ref2[_i];
            if (valid_actions[action] == null) {
              all_errors.push("State '" + name + "': can\'t permit nonexist action '" + action + "'");
              return false;
            }
          }
        }
        return true;
      };
    })(this);
    _ref2 = this.states;
    for (name in _ref2) {
      if (!__hasProp.call(_ref2, name)) continue;
      state = _ref2[name];
      if (isValidState(name, state)) {
        valid_states[name] = state;
      }
    }
    retval = {
      fields: this.fields,
      actions: valid_actions,
      states: valid_states
    };
    if (this.raw_data_processor == null) {
      all_errors.push("data_processor() not provided");
    } else {
      processor = this.raw_data_processor.validate();
      if (processor.errors.length > 0) {
        all_errors = all_errors.concat(processor.errors);
      } else {
        retval.data_processor = processor;
      }
    }
    retval.errors = all_errors;
    return retval;
  };

  ComponentDriverDSL.prototype.process_data = function(hex_raw_data) {
    return this.raw_data_processor.process(hex_raw_data);
  };

  return ComponentDriverDSL;

})();

if (typeof module !== "undefined" && module !== null) {
  module.exports = ComponentDriverDSL;
} else {
  driver = new ComponentDriverDSL();
}
