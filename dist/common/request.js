var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _$ = require('jquery');

var _$2 = _interopRequireWildcard(_$);

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
    if (opts && opts.url_params) {
      reqObj.url = request.processURLParams(reqObj.url, opts.url_params);
    }

    // Make (and return) AJAX request
    return _$2.default.ajax(reqObj);
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

exports.default = request;
module.exports = exports.default;