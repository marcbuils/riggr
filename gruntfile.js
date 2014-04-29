module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({

    // Get package JSON
    pkg: grunt.file.readJSON('package.json'),

    // JSBeautify Riggr files
    jsbeautifier: {
      riggr: {
        src: 'js/*.js',
        options: {
          config: '.jsbeautifyrc'
        }
      }
    },

    // JSHint Riggr files
    jshint: {
      riggr: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [ 'js/*.js' ]
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', [ 'jsbeautifier', 'jshint' ]);

};