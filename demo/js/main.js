require(['require-config'], function () {
  require([
    'riggr',
    'controllers/app',
    'components/components'
  ], function (rigg, app) {

    // Set app title
    app.title = 'Demo';
    
    // Set view transition
    app.transition = 150;
    // Set paths
    app.paths = {
      controllers: 'controllers',
      views: '../views',
      libs: 'libs'
    };
    
    // Initialize app
    rigg(app);

  });
});
