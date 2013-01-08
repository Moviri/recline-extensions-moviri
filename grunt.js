module.exports = function(grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
            lint: {
                all: ['grunt.js', 'app/lib/**/*.js']
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true,
                strict: true,
                browser: true
            },
            globals: {
                $: true,
                _: true
            }
        },
        min: {
            dist: {
                src: ['app/lib/**/*.js'],
                dest: 'dist/recline-extensions-moviri.min.js'
            },
            vendor: {
                src: ['vendor/scripts/**/*.js'],
                dest: 'dist/recline-extensions-moviri-vendor.min.js'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'lint min');

};