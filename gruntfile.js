var babel = require('babel');
var path = require('path');

module.exports = function (grunt) {
  'use strict';

  function babelOptions (format) {
    var isEs = format === 'es';
    return {
      whitelist: isEs ? [] : ['es6.modules'],
      modules: isEs ? 'ignore' : format
    };
  }
  var formats = ['amd', 'common', 'system', 'es', 'umd'];
  
  grunt.registerTask('default', 'Compile to various module formats', function (){
    grunt.file.recurse('src', function (abs, root, sub, file) {
      formats.forEach(function (format){
        var module = babel.transformFileSync(abs, babelOptions(format));
        var modulePath = path.join('dist', format, file);
        grunt.file.write(modulePath, module.code);
      });
    });
  });
};