// store.js
// Provides type and match based validation of object
// ---
// Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released
// under the MIT license. This notice must remain intact.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.validate = factory();
  }
}(this, function () {

  var validate = {

    // Contains custom check objects
    custom: {},

    // Add single object or array of objects to check lib
    add: function () {

    },

    // Check object or array or objects
    check: function () {

    }

  };

  return validate;

}));
