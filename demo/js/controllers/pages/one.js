define([
  'knockout'
], function (ko) {

  var one = {

    pageTitle: 'One',

    libs: {
      util: 'util'
    },

    // Observables
    email: ko.observable(),
    password: ko.observable(),

    // Check before loading route
    // Not required, just an example:
    before: function (fn) {
      console.log('Before One');
      fn(true); // ...or fn(false) to block access
    },

    // Any onload processes
    load: function () {
      console.log('Loaded One');
      // Fire util method
      console.log('libs', this.libs);
      this.libs.util.utilMethodOne();
    },

    // Run when leaving page
    // Not required, just an example
    unload: function () {
      console.log('Unloaded One');
    },

    // Example method
    processLogin: function () {
      alert('Email: ' + this.email() + ', Password: ' + this.password());
    }

  };

  return one;

});