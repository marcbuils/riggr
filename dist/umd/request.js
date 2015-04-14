(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'jquery'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('jquery'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.$);
    global.request = mod.exports;
  }
})(this, function (exports, module, _jquery) {
  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _$ = _interopRequire(_jquery);

  var request = {
    stored: {},
    send: function (req, opts) {
      var reqObj = {};
      // Determine type of call (stored or direct)
      if (req in request.stored) {
        // Get from storage
        for (var storedItem in request.stored[req]) {
          reqObj[storedItem] = request.stored[req][storedItem];
        }
        for (var opt in opts) {
          // Only includes standars opts, not proprietary url_params
          if (opt !== 'url_params') {
            reqObj[opt] = opts[opt];
          }
        }
      } else if (req && typeof req === 'object') {
        // Set reqObj to the request
        reqObj = req;
      }

      // Process URL parameters
      if (opts.url_params) {
        reqObj.url = request.processURLParams(reqObj.url, opts.url_params);
      }

      // Make (and return) AJAX request
      return _$.ajax(reqObj);
    },

    processURLParams: function (url, params) {
      return url.replace(/\{([^}]+)\}/g, function (i, match) {
        return params[match];
      });
    },

    create: function (name, opts) {
      request.stored[name] = opts;
    },

    remove: function (name) {
      delete request.stored[name];
    }
  };

  module.exports = request;
});