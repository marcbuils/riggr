import ko from 'knockout';
import $ from 'jquery';
import observer from 'observer';
import router from 'router';

// Base vars, defaults
var App;
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
  var applyLib = function (lib, libKey) {
    // Determine if this is a shared lib
    var isShared = (Object.prototype.toString.call(lib) === '[object Object]') ? true : false;

    // Warn if the app.paths.sharedLibs config is not defined
    if (isShared && !paths.sharedLibs) {
      console.error('The sharedLibs directory must be defined in the paths config before using a shared lib');
    }

    // Determine the lib path, shared libs will be objects
    var libPath = (isShared) ? paths.sharedLibs + '/' + lib.path : paths.libs + '/' + controller.libs[lib];

    rigg.moduleLoader([libPath], function (cur) {
      controller.libs[(isShared) ? libKey : lib] = cur;
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
      var libKey = false;
      if (Object.prototype.toString.call(controller.libs[lib]) === '[object Object]') {
        libKey = lib;
        lib = controller.libs[lib];
      }
      applyLib(lib, libKey);
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
  $(el).fadeTo(transition, 0, function () {
    // Set html
    $(el).html(view);
    // Bind it up
    ko.cleanNode(el);
    ko.applyBindings(controller, el);
    // Process transition-in
    $(this).fadeTo(transition, 1.0);
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
  App.timeStartRoute = +new Date();
};

/**
 * Registers and / or resets observables (used in controller before method)
 * @param self {Object} The controller scope
 */
var registerObservables = function (vm) {

  if (!vm) {
    console.error('Method register requires argument one to be controller scope');
    return;
  }

  var def;
  var isObservable;
  var koType;
  var value;
  var el = document.getElementById(viewContainer);

  // Unsubscribe all observables
  ko.cleanNode(el);

  for (var obsName in vm.observables) {
    def = vm.observables[obsName];
    if (def && def.reset === false && vm[obsName] !== void 0) {
      continue;
    }
    isObservable = def && def.type || def && def.value !== void 0 ? true : false;
    value = isObservable ? def.value : def;
    koType = ko.observable;
    if (def && def.type === 'array') {
      koType =ko.observableArray;
      value = value && value.length ? JSON.parse(JSON.stringify(value)) : [];
    } else {
      value = typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
    }
    if (ko.isObservable(vm[obsName])) {
      vm[obsName](value);
    } else {
      vm[obsName] = isObservable ? koType(value) : value;
    }
  }
};

// Builds route handlers and dom render handlers
var build = function (route, path) {
  rigg.moduleLoader([paths.controllers + '/' + path], function (controller) {
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
        registerObservables(controller);
        controller.before.apply(controller, arguments);
      };
    } else {
      routeHandler.before = function (fn) {
        registerObservables(controller);
        fn(true);
      };
    }

    // Create load handler
    if (controller.hasOwnProperty('load')) {
      routeHandler.load = function () {
        var args = arguments;
        rigg.templateLoader([paths.views + '/' + path + '.html'], function (view) {
          loadView(view, controller, args, true);
        });
      };
    } else {
      routeHandler.load = function () {
        rigg.templateLoader([paths.views + '/' + path + '.html'], function (view) {
          loadView(view, controller, [], false);
        });
      };
    }

    // Create unload handler
    if (controller.hasOwnProperty('unload')) {
      routeHandler.unload = controller.unload.bind(controller);
    }

    // Expose resetObservables method for the controller
    controller.resetObservables = function () {
      registerObservables(controller);
    };

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
  rigg.moduleLoader([paths.controllers + '/app'], function (app) {
    rigg.templateLoader([paths.views + '/app.html'], function (appView) {
      // Load view into main
      $('#' + appContainer).html(appView);
      // Apply app bindings
      ko.applyBindings(app);
      // Listen for route change
      observer.subscribe('onRoute', function () {
        if (app.hasOwnProperty('onRoute')) {
          app.onRoute.apply(app);
        }
        // Set current route on App
        App.curRoute = window.location.hash.substr(1);
      });
      // Check for 'load'
      if (app.hasOwnProperty('load')) {
        app.load.apply(app);
      }
      // Process routes
      router.process();
    });
  });
};

// Loops through and loads routes, sets app properties
export default function rigg (app) {
  // Expose app
  App = app;
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

    // Set tracking for time on route
    app.timeStartRoute = +new Date();

    // Build controller+route handlers
    for (var route in app.routes) {
      build(route, app.routes[route]);
    }
  });
}

rigg.templateLoader = function (templates, cb) {
  window['require'] && window['require'](templates.map(function (str) {
    return 'text!' + str;
  }),cb);
};

rigg.moduleLoader = function (modules, cb) {
  window['require'] && window['require'](modules, cb);
};