var _ = require('lodash');

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
  toHaveError: function() {
    return {
      compare: function(actual, expected) {
        var result = {};
        function checkErrors() {
          if (!actual.errors) return false;
          return _.some(actual.errors, function(msg) {
            return _.contains(msg, expected);
          });
        }
        result.pass = checkErrors();
        if (!result.pass) {
          result.message =  "Expected " + JSON.stringify(actual) + " to have error message '" + expected + "'";
        } else {
          result.message =  "Expected " + JSON.stringify(actual) + " to not have error message '" + expected + "'";
        }
        return result;
      }
    };
  }
};

module.exports = customMatchers;
