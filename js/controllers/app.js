define([
  'knockout'
], function (ko) {

  var app = {

    // Test observable
    timestamp: ko.observable(+new Date()),

    // Route table
    // Format: {route}: {path/to/controller}
    routes: {
      '/': 'index',
      '/setup': 'setup',
      '/bindings': 'bindings',
      '/routing': 'routing',
      '/observer': 'observer',
      '/requests': 'requests',
      '/store': 'store',
      '/indexed': 'indexed',
      '/validation': 'validation',
      //
      '/404': '404'
    },

    // Run when app is loaded
    load: function () {
      // ...
    },

    // On route loaded/changed
    onRoute: function () {
      // Set timestamp observable
    }
  };

  return app;

});