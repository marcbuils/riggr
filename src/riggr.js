// riggr.js
// Builds core application methods, binds routes, and loads init from app.js
// ---
// Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released
// under the MIT license. This notice must remain intact.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['router', 'observer', 'knockout', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('router'), require('observer'), require('knockout'), require('jquery'));
  } else {
    root.riggr = factory(root.router, root.observer, root.ko, root.$);
  }
}(this, function (router, observer, ko) {

  // Base vars, defaults
  var count = 0;
  var loaded = 0;
  var appTitle = false;
  var transition = 0;
  var controllers = [];
  var paths = {
    controllers: 'controllers',
    views: 'views',
    libs: 'libs',
    sharedLibs: false
  };
  var appContainer = 'appContainer';
  var viewContainer = 'viewContainer';
  var beforeRoute = false;

  // Sets title
  var setTitle = function (pageTitle) {
    // Both app and page title
    if (appTitle && pageTitle) {
      document.title = pageTitle + ' | ' + appTitle;
    }
    // App title only
    if (appTitle && !pageTitle) {
      document.title = appTitle;
    }
    // Page title only
    if (!appTitle && pageTitle) {
      document.title = pageTitle;
    }
  };

  // Apply libs
  var applyLibs = function (controller, cb) {
    var totalLibs;
    var libsLoaded = 0;
    
    // Applies lib to controller lib object
    var applyLib = function (lib) {
      // Determine if this is a shared lib
      var isShared = (Object.prototype.toString.call(lib) === '[object Object]') ? true : false;
      
      // Warn if the app.paths.sharedLibs config is not defined
      if (isShared && !paths.sharedLibs) {
        console.error('The sharedLibs directory must be defined in the paths config before using a shared lib');
      }
      
      // Determine the lib path, shared libs will be objects
      var libPath = (isShared) ? paths.sharedLibs + '/' + lib.path : paths.libs + '/' + controller.libs[lib];
      
      require([libPath], function (cur) {
        controller.libs[(isShared) ? lib.path : lib] = cur;
        // Increment libs loaded count
        libsLoaded++;
        // All libs loaded?
        if (libsLoaded === totalLibs) {
          // Fire callback
          cb();
        }
      });
    };

    // Add libs to controller
    if (controller.hasOwnProperty('libs')) {
      totalLibs = Object.keys(controller.libs).length;
      for (var lib in controller.libs) {
        // Set libs.{key} to required lib for use
        if (Object.prototype.toString.call(controller.libs[lib]) === '[object Object]') {
          lib = controller.libs[lib];
        }
        applyLib(lib);
      }
    } else {
      // No libs, fire callback
      cb();
    }
  };

  // Build load handler
  var loadView = function (view, controller, args, load) {
    var el = document.getElementById(viewContainer);
    // Transition-out
    $(el).fadeOut(transition, function () {
      // Set html
      $(el).html(view);
      // Bind it up
      ko.cleanNode(el);
      ko.applyBindings(controller, el);
      // Process transition-in
      $(this).fadeIn(transition);
      // Fire load
      if (load) {
        controller.load.apply(controller, args);
      }
      // Publish onRoute
      observer.publish('onRoute');
    });
    // Set page title
    if (controller.hasOwnProperty('pageTitle')) {
      setTitle(controller.pageTitle);
    } else {
      setTitle(false);
    }
  };

  /**
   * Registers and / or resets observables (used in controller before method)
   * @param self {Object} The controller scope
   */
  var registerObservables = function (self) {
    // Make sure the controller scope was passed
    if (!self) {
      console.error('Method register requires argument one to be controller scope');
      return;
    }

    // Do nothing if observables is not defined
    if (!self.observables) {
      return;
    }

    // Get the observables config
    var obs = self.observables;

    // Loop through obs and create or reset observables
    for (var name in obs) {
      // Check if the observable exists
      if (self[name] && Object.prototype.toString.call(self[name]) === '[object Function]') {
        // Check if the observable should not be reset
        if (obs[name].hasOwnProperty('reset') && obs[name].reset === false) {
          continue;
        }
        // reset the observable or non observable
        if (Object.prototype.toString.call(obs[name]) !== '[object Object]') {
          self[name] = obs[name].value;
        } else {
          var value = (obs[name].type === 'array' && !obs[name].value) ? [] : obs[name].value;
          self[name](value);
        }
      } else {
        // Create the observable
        self[name] = (obs[name] && obs[name].type === 'array') ? ko.observableArray(obs[name].value) :
          (obs[name] === null || Object.prototype.toString.call(obs[name]) !== '[object Object]') ? obs[name] :
          ko.observable(obs[name].value);
      }
    }
  };

  // Builds route handlers and dom render handlers
  var build = function (route, path) {
    require([paths.controllers + '/' + path], function (controller) {
      // Fire the controller's init method
      if (controller.init && {}.toString.call(controller.init) === '[object Function]' && !controller.hasInit) {
        controller.init();
        // In some cases a route controller may be call twice when the route is used more than once
        // in the routes config. Mark a checked conditional value to prevent this.
        controller.hasInit = true;
      }

      controllers.push(controller);

      var routeHandler = {};

      // Check for (and add) app-level beforeRoute
      if (beforeRoute) {
        routeHandler.beforeAppRoute = beforeRoute;
      }

      // Create before handler
      if (controller.hasOwnProperty('before')) {
        routeHandler.before = function () {
          var args = arguments;
          registerObservables(controller);
          controller.before.apply(controller, args);
        };
      }

      // Create load handler
      if (controller.hasOwnProperty('load')) {
        routeHandler.load = function () {
          var args = arguments;
          require(['text!' + paths.views + '/' + path + '.html'], function (view) {
            loadView(view, controller, args, true);
          });
        };
      } else {
        routeHandler.load = function () {
          require(['text!' + paths.views + '/' + path + '.html'], function (view) {
            loadView(view, controller, [], false);
          });
        };
      }

      // Create unload handler
      if (controller.hasOwnProperty('unload')) {
        routeHandler.unload = controller.unload.bind(controller);
      }

      // Apply libs
      applyLibs(controller, function () {

        // Create route
        router.on(route, routeHandler);

        // Increment loaded tracker
        loaded++;

        // On last route, process...
        if (count === loaded) {
          loadApp();
        }

      });

    });
  };

  // Load the main app controller and view
  var loadApp = function () {
    require([paths.controllers + '/app', 'text!' + paths.views + '/app.html'], function (app, appView) {
      // Load view into main
      $('#' + appContainer).html(appView);
      // Apply app bindings
      ko.applyBindings(app);
      // Listen for route change
      observer.subscribe('onRoute', function () {
        if (app.hasOwnProperty('onRoute')) {
          app.onRoute.apply(app);
        }
      });
      // Check for 'load'
      if (app.hasOwnProperty('load')) {
        app.load.apply(app);
      }
      // Process routes
      router.process();
    });
  };

  // Loops through and loads routes, sets app properties
  var rigg = function (app) {
    // Get size
    Object.size = function (obj) {
      var size = 0,
        key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          size++;
        }
      }
      return size;
    };

    // Check for paths overrides
    if (app.hasOwnProperty('paths')) {
      paths = app.paths;
    }

    // Check for app-level beforeRoute
    if (app.hasOwnProperty('beforeRoute')) {
      beforeRoute = app.beforeRoute.bind(app);
    }

    // Apply libs
    applyLibs(app, function () {
      // Set title
      appTitle = (app.hasOwnProperty('title')) ? app.title : false;
      setTitle('Loading');

      // Set transition
      transition = (app.hasOwnProperty('transition')) ? app.transition : 0;

      // Set count
      count = Object.size(app.routes);

      // Fire the app controller's init method
      if (app.init && {}.toString.call(app.init) === '[object Function]') {
        app.init();
      }

      // Build controller+route handlers
      for (var route in app.routes) {
        build(route, app.routes[route]);
      }
    });
  };

  return rigg;

}));
