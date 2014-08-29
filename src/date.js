// Format dates using the desired patterns
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
     * d    | Day of the month, 1 digit
     * -------------------------------------------------------------------------
     * dd   | Day of the month, 2 digits with leading zeros
     * -------------------------------------------------------------------------
     * D    | A textual representation of a day, three letters
     * -------------------------------------------------------------------------
     * DD   | A full textual representation of the day of the week
     * -------------------------------------------------------------------------
     * m    | Month as single digit
     * -------------------------------------------------------------------------
     * mm   | Month as 2 digits with leading zeros
     * -------------------------------------------------------------------------
     * M    | A textual representation of the month
     * -------------------------------------------------------------------------
     * MM   | A full textual representation of the month
     * -------------------------------------------------------------------------
     * yy   | Year as last two digits; leading zero where necessary
     * -------------------------------------------------------------------------
     * yyyy | Year represented by four digits
     * -------------------------------------------------------------------------
     * h    | Hours, no leading zero where necessary (12 Hour)
     * -------------------------------------------------------------------------
     * hh   | Hours with leading zero (12 Hour)
     * -------------------------------------------------------------------------
     * H    | Hours, no leading zero where necessary (24 Hour)
     * -------------------------------------------------------------------------
     * HH   | Hours with leading zero (24 Hour)
     * -------------------------------------------------------------------------
     * i    | Minutes with no leading zero
     * -------------------------------------------------------------------------
     * ii    | Minutes with leading zero
     * -------------------------------------------------------------------------
     * s    | Seconds with no leading zero
     * -------------------------------------------------------------------------
     * ss   | Seconds with leading zero
     * -------------------------------------------------------------------------
     * l    | Milliseconds as three digits
     * -------------------------------------------------------------------------
     * L    | Milliseconds as two digits
     * -------------------------------------------------------------------------
     * a    | Lowercase single character Ante meridiem and Post meridiem (a or p)
     * -------------------------------------------------------------------------
     * aa   | Lowercase two character Ante meridiem and Post meridiem (am or pm)
     * -------------------------------------------------------------------------
     * A    | Uppercase single character Ante meridiem and Post meridiem (A or P)
     * -------------------------------------------------------------------------
     * AA   | Uppercase two character Ante meridiem and Post meridiem (AM or PM)
     * -------------------------------------------------------------------------
     * e    | US timezone abbreviation, e.g. EST or CST
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
     * Array of allowed presets
     */
    presets: {
      'default': 'D M dd yyyy HH:ii:ss',
      shortDate: 'm/d/yy',
      mediumDate: 'M d, yyyy',
      longDate: 'MM d, yyyy',
      fullDate: 'DD, MM d, yyyy',
      shortTime: 'h:ii AA',
      mediumTime: 'h:ii:ss AA',
      longTime: 'h:ii:ss AA e',
      isoDate: 'yyyy-mm-dd',
      isoTime: 'HH:ii:ss',
      isoDateTime: 'yyyy-mm-dd\'A\'HH:ii:ss',
      isoUtcDateTime: 'UTC:yyyy-mm-dd\'A\'HH:ii:ss\'e\''
    },

    /**
     * Put day / month names in i18n object; can be hooked to i18n class later
     */
    i18n: {
      days: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
      ],
      daysFull: [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      months: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      monthsFull: [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },

    /**
     * Adds leading zeros to a string
     * @param val {String} The value to pad
     * @param len {Integer} The string length with zeros (e.g. 2 will pad a single digit with one zero)
     */
    pad: function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    },

    /**
     * Formats a date based on the specific preset
     * @param date {Date|String} The date to format
     * @param preset {String} The specific preset to utilize
     * @param utc {Boolean} True to utilize UTC dates
     * @return
     */
    format: function (date, preset, utc) {
      var self = this;

      // Define regex values
      var token = /d{1,2}|D{1,2}|m{1,2}|M{1,2}|yy(?:yy)?|([HhisAa])\1?|[LloSe]|"[^"]*"|'[^']*'/g;
      var timezoneClip = /[^-+\dA-Z]/g;
      var timezone = '/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) ' +
        '(?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\\d{4})?)\\b/g';
      timezone = new RegExp(timezone);

      // Check arguments for any skipped
      if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
        preset = date;
        date = undefined;
      }

      // JavaScript's date method cannot process PM in the string, so we'll cleanse both ante and post
      if (isNaN(date)) {
        date = date.replace(/AM|am|PM|pm/gi, '');
      }

      // Passing date through Date applies Date.parse, if necessary
      date = (date) ? new Date(date) : new Date();
      if (isNaN(date)) {
        throw new SyntaxError('Invalid Date');
      }

      preset = String(this.presets[preset] || preset || this.presets['default']);

      // Allow setting the utc argument via the preset
      if (preset.slice(0, 4) === 'UTC:') {
        preset = preset.slice(4);
        utc = true;
      }

      // Define various format properties
      var _ = (utc) ? 'getUTC' : 'get';
      var nDate = date[_ + 'Date']();
      var Day = date[_ + 'Day']();
      var Month = date[_ + 'Month']();
      var Year = date[_ + 'FullYear']();
      var Hours = date[_ + 'Hours']();
      var Minutes = date[_ + 'Minutes']();
      var Seconds = date[_ + 'Seconds']();
      var Milliseconds = date[_ + 'Milliseconds']();
      var Offset = (utc) ? 0 : date.getTimezoneOffset();

      // Patterns to match from
      var patterns = {
        d: nDate,
        dd: self.pad(nDate),
        D: self.i18n.days[Day],
        DD: self.i18n.daysFull[Day],
        m: Month + 1,
        mm: self.pad(Month + 1),
        M: self.i18n.months[Month],
        MM: self.i18n.monthsFull[Month],
        yy: String(Year).slice(2),
        yyyy: Year,
        h: Hours % 12 || 12,
        hh: self.pad(Hours % 12 || 12),
        H: Hours,
        HH: self.pad(Hours),
        i: Minutes,
        ii: self.pad(Minutes),
        s: Seconds,
        ss: self.pad(Seconds),
        l: self.pad(Milliseconds, 3),
        L: self.pad((Milliseconds > 99) ? Math.round(Milliseconds / 10) : Milliseconds),
        a: Hours < 12 ? 'a' : 'p',
        aa: Hours < 12 ? 'am' : 'pm',
        A: Hours < 12 ? 'A' : 'P',
        AA: Hours < 12 ? 'AM' : 'PM',
        e: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
        o: (Offset > 0 ? '-' : '+') + self.pad(Math.floor(Math.abs(Offset) / 60) * 100 + Math.abs(Offset) % 60, 4),
        S: ['th', 'st', 'nd', 'rd'][nDate % 10 > 3 ? 0 : (nDate % 100 - nDate % 10 !== 10) * nDate % 10]
      };

      // Get and send the new date value back
      return preset.replace(token, function (output) {
        return (output in patterns) ? patterns[output] : output.slice(1, output.length - 1);
      });
    },

    /**
     * Returns the elapsed time from an existing timestamp
     * @param timestamp {Integer} The timestamp to measure against
     * @return The elapsed time
     */
    elapsedTime: function (timestamp) {
      var tMinute = 60 * 1000;
      var tHour = tMinute * 60;
      var tDay = tHour * 24;
      var tMonth = tDay * 30;
      var tYear = tDay * 365;
      var text;

      var elapsed = new Date().getTime() - timestamp;

      if (elapsed < tMinute) {
        text = (Math.round(elapsed / 1000) === 1) ? 'second' : 'seconds';
        return Math.round(elapsed / 1000) + ' ' + text;
      } else if (elapsed < tHour) {
        text = (Math.round(elapsed / tMinute) === 1) ? 'minute' : 'minutes';
        return Math.round(elapsed / tMinute) + ' ' + text;
      } else if (elapsed < tDay) {
        text = (Math.round(elapsed / tHour) === 1) ? 'hour' : 'hours';
        return Math.round(elapsed / tHour) + ' ' + text;
      } else if (elapsed < tMonth) {
        text = (Math.round(elapsed / tDay) === 1) ? 'day' : 'days';
        return 'approximately ' + Math.round(elapsed / tDay) + ' ' + text;
      } else if (elapsed < tYear) {
        text = (Math.round(elapsed / tMonth) === 1) ? 'month' : 'months';
        return 'approximately ' + Math.round(elapsed / tMonth) + ' ' + text;
      } else {
        text = (Math.round(elapsed / tYear) === 1) ? 'year' : 'years';
        return 'approximately ' + Math.round(elapsed / tYear) + ' ' + text;
      }
    },
  };

  return date;

}));
