var ARGUMENT_NAMES, Action, CRITICAL, ComponentDriverDSL, DEBUG, ERROR, INFO, RawDataProcessor, STRIP_COMMENTS, WARNING, critical, debug, driver, error, getParamNames, info, typeIsArray, warning,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty;

CRITICAL = 50;

ERROR = 40;

WARNING = 30;

INFO = 20;

DEBUG = 10;

critical = function(msg) {
  return log(CRITICAL, msg);
};

error = function(msg) {
  return log(ERROR, msg);
};

warning = function(msg) {
  return log(WARNING, msg);
};

info = function(msg) {
  return log(INFO, msg);
};

debug = function(msg) {
  return log(DEBUG, msg);
};

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
        options: options,
        sequence: this.parameter_names.indexOf(name)
      };
    }
    return this;
  };

  Action.prototype.validate = function() {
    var all_errors, index, name, retval, _i, _len, _ref;
    all_errors = [].concat(this.errors);
    _ref = this.parameter_names;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      name = _ref[index];
      if (this.parameters[name] == null) {
        all_errors.push("Parameter '" + name + "' not defined for action '" + this.name + "'");
      }
    }
    retval = {
      desc: this.desc,
      parameters: this.parameters
    };
    if (all_errors.length > 0) {
      retval.errors = all_errors;
    }
    return retval;
  };

  return Action;

})();

RawDataProcessor = (function() {
  function RawDataProcessor(fn) {
    this.fn = fn;
    this.states = {};
    this.errors = [];
  }

  RawDataProcessor.prototype.process = function(device_id, device_type, timestamp, raw_data) {
    return this.fn(device_id, device_type, timestamp, raw_data);
  };

  RawDataProcessor.prototype.data = function(data_fields) {
    this.data_fields = data_fields;
    this.will_return_data = true;
    return this;
  };

  RawDataProcessor.prototype.state = function(name, desc, permitted_actions) {
    if (typeof name !== 'string' || name.trim().length === 0 || typeof desc !== 'string' || desc.trim().length === 0 || !Array.isArray(permitted_actions) || permitted_actions.length === 0) {
      this.errors.push("Please call state(name, desc, permitted_actions)");
    } else {
      this.states[name] = {
        name: name,
        desc: desc,
        permitted_actions: permitted_actions
      };
    }
    this.will_return_state = true;
    return this;
  };

  RawDataProcessor.prototype.validate = function() {
    var checkType, item, key, retval, _ref;
    retval = {};
    checkType = (function(_this) {
      return function(item) {
        var _ref;
        switch (item.type) {
          case "number":
            if (typeof item.unit !== 'string' || item.unit.trim().length === 0) {
              _this.errors.push("data type 'number' should have unit");
              return false;
            } else {
              if (item.decimals == null) {
                item.decimals = 0;
              }
              if (typeof item.decimals !== 'number' || item.decimals % 1 !== 0 || !((0 <= (_ref = item.decimals) && _ref <= 9))) {
                _this.errors.push("decimals of data type 'number' should within range [0..9]");
                return false;
              } else {
                return true;
              }
            }
            break;
          case "boolean":
            if (typeof item["true"] !== 'string' || item["true"].trim().length === 0 || typeof item["false"] !== 'string' || item["false"].trim().length === 0) {
              _this.errors.push("should specify meaning for 'true' and 'false' of boolean type");
              return false;
            } else {
              return true;
            }
            break;
          case "string":
            return true;
          default:
            _this.errors.push("allowed return data types are 'number', 'string' and 'boolean'");
            return false;
        }
      };
    })(this);
    if (!this.will_return_data && !this.will_return_state) {
      this.errors.push("data_processor should have data() or state(), or both");
    } else {
      _ref = this.data_fields;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        item = _ref[key];
        if (typeof item.name !== 'string' || item.name.trim().length === 0) {
          this.errors.push("returned data '" + key + "' should have name");
        } else if (typeof item.type !== 'string' || item.type.trim().length === 0) {
          this.errors.push("returned data '" + key + "' should have type");
        } else if (checkType(item)) {
          retval.will_return_data = true;
          retval.data_fields = this.data_fields;
        }
      }
      retval.will_return_state = !!this.will_return_state;
    }
    retval.states = this.states;
    if (this.errors.length > 0) {
      retval.errors = this.errors;
    }
    return retval;
  };

  return RawDataProcessor;

})();

ComponentDriverDSL = (function() {
  var required_fields, splat;

  required_fields = ['name', 'version', 'desc', 'author', 'email', 'protocol'];

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

  ComponentDriverDSL.prototype.protocol = function(str) {
    this.field_given.protocol = true;
    this.fields.protocol = str;
    return this;
  };

  ComponentDriverDSL.prototype.action = function(name, desc, fn) {
    if (typeof name !== 'string' || name.trim().length === 0 || typeof desc !== 'string' || desc.trim().length === 0 || typeof fn !== 'function') {
      return this.addError("Please call action(name, desc, fn)");
    } else {
      return this.actions[name] = new Action(name, desc, fn);
    }
  };

  ComponentDriverDSL.prototype.data_processor = function(fn) {
    var arrayEquals, params, required_params;
    arrayEquals = function(s, o) {
      var i, _i, _ref;
      if (s === o) {
        return true;
      }
      if (s.length !== o.length) {
        return false;
      }
      for (i = _i = 0, _ref = s.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (s[i] !== o[i]) {
          return false;
        }
      }
      return true;
    };
    required_params = ['device_id', 'device_type', 'timestamp', 'raw_data'];
    params = getParamNames(fn);
    if (arrayEquals(params, required_params)) {
      return this.raw_data_processor = new RawDataProcessor(fn);
    } else {
      return error("data_processor should have exactly 4 parameters: " + required_params);
    }
  };

  ComponentDriverDSL.prototype.data_fetcher = function(fetcher) {
    this.fetcher = fetcher;
  };

  ComponentDriverDSL.prototype.validate = function() {
    var action, all_errors, err, field, given, isValidState, name, processor, retval, state, valid_actions, valid_states, _i, _len, _ref, _ref1, _ref2;
    all_errors = [].concat(this.errors);
    _ref = this.field_given;
    for (field in _ref) {
      if (!__hasProp.call(_ref, field)) continue;
      given = _ref[field];
      if (!given) {
        all_errors.push("Driver " + field + "() is required");
      }
    }
    valid_actions = {};
    _ref1 = this.actions;
    for (name in _ref1) {
      if (!__hasProp.call(_ref1, name)) continue;
      action = _ref1[name];
      action = action.validate();
      if (action.errors != null) {
        all_errors = all_errors.concat(action.errors);
      } else {
        valid_actions[name] = action;
      }
    }
    retval = {
      fields: this.fields,
      actions: valid_actions
    };
    if (this.fetcher != null) {
      retval.passive = true;
    }
    if (this.raw_data_processor == null) {
      all_errors.push("data_processor() not provided");
    } else {
      processor = this.raw_data_processor.validate();
      if (processor.errors) {
        all_errors = all_errors.concat(processor.errors);
      }
      valid_states = {};
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
      _ref2 = processor.states;
      for (name in _ref2) {
        if (!__hasProp.call(_ref2, name)) continue;
        state = _ref2[name];
        if (isValidState(name, state)) {
          valid_states[name] = state;
        }
      }
      retval.states = valid_states;
      retval.data_fields = processor.data_fields || {};
    }
    if (all_errors.length > 0) {
      retval.errors = all_errors;
      for (_i = 0, _len = all_errors.length; _i < _len; _i++) {
        err = all_errors[_i];
        error(err);
      }
    }
    return retval;
  };

  ComponentDriverDSL.prototype.process_data = function(device_id, device_type, timestamp, raw_data) {
    var e;
    try {
      return this.raw_data_processor.process(device_id, device_type, timestamp, raw_data);
    } catch (_error) {
      e = _error;
      return error("Error in process_data(" + device_id + ", " + device_type + ", " + timestamp + ", " + raw_data + "): " + e.name + " - " + e.message);
    }
  };

  splat = function(result, subject) {
    var device_id, item, result_array, _i, _len;
    result_array = [];
    if (typeIsArray(result)) {
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        item = result[_i];
        if (__indexOf.call(item.keys(), 'device_id') < 0 || __indexOf.call(item.keys(), 'ctrl_msg') < 0) {
          error("" + subject + " should return array of {device_id, ctrl_msg}");
        } else {
          result_array.push(item);
        }
      }
    } else if (typeof result === 'string') {
      for (device_id in devices_dict) {
        result_array.push({
          device_id: device_id,
          ctrl_msg: result
        });
      }
    } else {
      error("" + subject + " should return array or string");
    }
    return result_array;
  };

  ComponentDriverDSL.prototype.translate_action = function(name, parameters) {
    var action, e, param, param_name, real_params, result, value;
    action = this.actions[name];
    if (action == null) {
      return error("Action " + name + " doesn't exist");
    } else {
      real_params = [];
      for (param_name in parameters) {
        value = parameters[param_name];
        param = action.parameters[param_name];
        if (param != null) {
          real_params[param.sequence] = value;
        }
      }
      try {
        result = action.fn.apply(null, real_params);
        return splat(result, "Action " + name);
      } catch (_error) {
        e = _error;
        return error("Error in translate_action(\"" + name + "\"): " + e.name + " - " + e.message);
      }
    }
  };

  ComponentDriverDSL.prototype.fetch_data = function() {
    var e, result;
    try {
      result = this.fetcher();
      return splat(result, "data_fetcher()");
    } catch (_error) {
      e = _error;
      return error("Error in fetch_data(): " + e.name + " - " + e.message);
    }
  };

  return ComponentDriverDSL;

})();

if (typeof module !== "undefined" && module !== null) {
  module.exports = ComponentDriverDSL;
} else {
  driver = new ComponentDriverDSL();
}
