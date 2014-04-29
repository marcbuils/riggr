// validate.js
// Provides type and match based validation of objects
// ---
// Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released
// under the MIT license. This notice must remain intact.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.validation = factory();
  }
}(this, function () {

  var validation = {

    // Array of type tests
    types: ['undefined', 'null', 'number', 'boolean', 'string', 'array', 'object', 'function'],

    // Contains matching tests (regex)
    matches: {
      float: /^[0-9]*[.][0-9]+$/,
      alphanum: /^[a-zA-Z0-9]+$/,
      hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/,
      slug: /^[a-z0-9-]+$/,
      email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
      url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      password: /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$/
    },

    // Adds a test
    add: function (name, test) {
      this.matches[name] = test;
    },

    // Processes and runs validation tests
    test: function (tests) {
      var failures = {};
      if (this.typeOf(tests) === 'object') {
        // Loop through tests
        for (var i in tests) {
          // Is this a type check?
          if (this.types.indexOf(i) >= 0) {
            // Check type
            if (this.typeOf(tests[i]) !== i) {
              // Add to failures
              failures[i] = tests[i];
            }
          } else if (this.matches.hasOwnProperty(i)) {
            // Regex
            var regex = new RegExp(this.matches[i]);
            if (!regex.test(tests[i])) {
              // Add to failures
              failures[i] = tests[i];
            }
          } else {
            // Couldn't find a test
            failures[i] = 'MISSING TEST';
          }
        }
        // Check if failures
        if (Object.keys(failures).length) {
          return failures; // Return object containing failures
        } else {
          return true; // Pass
        }
      } else {
        console.error('Must be in { test: value } format');
      }
    },

    // Check type
    typeOf: function (obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

  };

  return validation;

}));
