var customMatchers = {
  toHaveField: function() {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = (actual.fields && actual.fields[expected]);
        if (!result.pass) {
          result.message =  "Expected " + JSON.stringify(actual) + " to have field " + expected;
        } else {
          result.message =  "Expected " + JSON.stringify(actual) + " to not have field " + expected;
        }
        return result;
      }
    };
  },
  toHaveAction: function() {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = (actual.actions && actual.actions[expected]);
        if (!result.pass) {
          result.message =  "Expected " + JSON.stringify(actual) + " to have action " + expected;
        } else {
          result.message =  "Expected " + JSON.stringify(actual) + " to not have action " + expected;
        }
        return result;
      }
    };
  },
  toHaveErrorOn: function() {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = (actual.errors && actual.errors[expected]);
        if (!result.pass) {
          result.message =  "Expected " + JSON.stringify(actual) + " to have error on " + expected;
        } else {
          result.message =  "Expected " + JSON.stringify(actual) + " to not have error on " + expected;
        }
        return result;
      }
    };
  }
};

module.exports = customMatchers;
