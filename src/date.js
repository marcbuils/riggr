// Formats dates to the desired format
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.version = factory(root.$);
  }
}(this, function () {

  var date = {
    /**
     * List of supported characters
     *
     * d    | Day of the month as digits; no leading zero for single-digit days
     * -------------------------------------------------------------------------
     * dd   | Day of the month as digits; leading zero for single-digit days
     * -------------------------------------------------------------------------
     * ddd  | Day of the week as a three-letter abbreviation
     * -------------------------------------------------------------------------
     * dddd | Day of the week as its full name
     * -------------------------------------------------------------------------
     * m    | Month as digits; no leading zero for single-digit months
     * -------------------------------------------------------------------------
     * mm   | Month as digits; leading zero for single-digit months
     * -------------------------------------------------------------------------
     * mmm  | Month as a three-letter abbreviation
     * -------------------------------------------------------------------------
     * mmmm | Month as its full name
     * -------------------------------------------------------------------------
     * yy   | Year as last two digits; leading zero for years less than 10
     * -------------------------------------------------------------------------
     * yyyy | Year represented by four digits
     * -------------------------------------------------------------------------
     * h    | Hours; no leading zero for single-digit hours (12-hour clock)
     * -------------------------------------------------------------------------
     * hh   | Hours; leading zero for single-digit hours (12-hour clock)
     * -------------------------------------------------------------------------
     * H    | Hours; no leading zero for single-digit hours (24-hour clock)
     * -------------------------------------------------------------------------
     * HH   | Hours; leading zero for single-digit hours (24-hour clock)
     * -------------------------------------------------------------------------
     * M    | Minutes; no leading zero for single-digit minutes
     * -------------------------------------------------------------------------
     * MM   | Minutes; leading zero for single-digit minutes
     * -------------------------------------------------------------------------
     * s    | Seconds; no leading zero for single-digit seconds
     * -------------------------------------------------------------------------
     * ss   | Seconds; leading zero for single-digit seconds
     * -------------------------------------------------------------------------
     * l    | Milliseconds; three digits
     * -------------------------------------------------------------------------
     * L    | Milliseconds; two digits
     * -------------------------------------------------------------------------
     * t    | Lowercase, single-character time marker string: a or p
     * -------------------------------------------------------------------------
     * tt   | Lowercase, two-character time marker string: am or pm
     * -------------------------------------------------------------------------
     * T    | Uppercase, single-character time marker string: A or P
     * -------------------------------------------------------------------------
     * TT   | Uppercase, two-character time marker string: AM or PM
     * -------------------------------------------------------------------------
     * Z    | US timezone abbreviation, e.g. EST or CST
     * -------------------------------------------------------------------------
     * o    | GMT/UTC timezone offset, e.g. -0400 or +0430
     * -------------------------------------------------------------------------
     * S    | The date's ordinal suffix (st, nd, rd, or th)
     * -------------------------------------------------------------------------
     * UTC: | Converts the date from local time to UTC/GMT/Zulu
     *      | (Must be the first 4 letters of pattern)
     * -------------------------------------------------------------------------
     *
     */

    /**
     * Array of allowed patterns presets
     */
    patterns: {
      'default': 'ddd mmm dd yyyy HH:MM:ss',
      shortDate: 'm/d/yy',
      mediumDate: 'mmm d, yyyy',
      longDate: 'mmmm d, yyyy',
      fullDate: 'dddd, mmmm d, yyyy',
      shortTime: 'h:MM TT',
      mediumTime: 'h:MM:ss TT',
      longTime: 'h:MM:ss TT Z',
      isoDate: 'yyyy-mm-dd',
      isoTime: 'HH:MM:ss',
      isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
      isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
    },

    /**
     * Put day / month names in i18n object; can be hooked to i18n class later
     */
    i18n: {
      dayNames: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      monthNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },

    /**
     * Formats a date based on the specific pattern
     * @param date {Date|String} The date to format
     * @param pattern {String} The specific pattern to utilize
     * @return
     */
    format: function (date, pattern, utc) {
      var self = this;

      // Define regex values
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
      var timezoneClip = /[^-+\dA-Z]/g;
      var timezone = '/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) ' +
        '(?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\\d{4})?)\\b/g';
      timezone = new RegExp(timezone);

      // Used to pad date values
      var pad = function (val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
          val = '0' + val;
        }
        return val;
      };

      // Check arguments for any skipped
      if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
        pattern = date;
        date = undefined;
      }

      // Passing date through Date applies Date.parse, if necessary
      date = date ? new Date(date) : new Date();
      if (isNaN(date)) {
        throw new SyntaxError('Invalid Date');
      }

      pattern = String(this.patterns[pattern] || pattern || this.patterns['default']);

      // Allow setting the utc argument via the pattern
      if (pattern.slice(0, 4) === 'UTC:') {
        pattern = pattern.slice(4);
        utc = true;
      }

      // Define various format properties
      var _ = utc ? 'getUTC' : 'get';
      var d = date[_ + 'Date']();
      var D = date[_ + 'Day']();
      var m = date[_ + 'Month']();
      var y = date[_ + 'FullYear']();
      var H = date[_ + 'Hours']();
      var M = date[_ + 'Minutes']();
      var s = date[_ + 'Seconds']();
      var L = date[_ + 'Milliseconds']();
      var o = utc ? 0 : date.getTimezoneOffset();

      // Pattern flags
      var flags = {
        d: d,
        dd: pad(d),
        ddd: self.i18n.dayNames[D],
        dddd: self.i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: self.i18n.monthNames[m],
        mmmm: self.i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(L > 99 ? Math.round(L / 10) : L),
        t: H < 12 ? 'a' : 'p',
        tt: H < 12 ? 'am' : 'pm',
        T: H < 12 ? 'A' : 'P',
        TT: H < 12 ? 'AM' : 'PM',
        Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
      };

      // Get and send the new date value back
      return pattern.replace(token, function ($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
      });
    }
  };

  return date;

}));
