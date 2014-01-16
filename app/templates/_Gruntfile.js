'use strict';

var os = require('os'),
    exec = require('child_process').exec,
    appUseJquery = <%= useJquery %>,
    appAddHtml5shiv = <%= addHtml5shiv %>,
    appAddFavicon = <%= addFavicon %>,
    serverPort = <%= projectLocalServerPort %>,
    pathFinal = '<%= projectPath %>/<%= _.slugify(projectName) %>-1/';

module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    var buildConfigMain = grunt.file.readJSON('tools/build.js'),
        dev = 'dev/',
        build = 'build/',
        pathBuildDoc = build + 'Documents/app/',
        pathDevDoc = dev + 'Documents/app/',
        pathDevJs = pathDevDoc + 'js/',
        dbFiles = ['pt_BR', 'en_US', 'es_ES'],
        jadeConfig = {},
        serverData;

    dbFiles.forEach(function(el, idx, arr) {
        var f = 'db/' + el + '.json',
            j = grunt.file.readJSON(f);
        if (j !== null) {
            jadeConfig[el] = buildJade(el, pathFinal, appUseJquery, appAddHtml5shiv, appAddFavicon, j, false);
            if (idx === 0) {
                serverData = j;
            }
        } else {
            grunt.fail.fatal('Problem with db: ' + f + ' not found');
        }
    });

    jadeConfig.server = buildJade('server', '/', appUseJquery, appAddHtml5shiv, true, serverData, true);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            app: {
                src: [build, pathDevDoc + '*.html', pathDevDoc + '*.txt']
            }
        },
        jshint: {
            app: {
                files: {
                    src: [pathDevJs + '**/*.js']
                },
                options: {
                    jshintrc: '.jshintrc',
                    ignores: [pathDevJs + 'lib.*']
                }
            }
        },
        compass: {
            app: {
                options: {
                    config: 'config.rb'
                }
            }
        },
        jade: jadeConfig,
        connect: {
            dev: buildConnect(serverPort, '*', false, true, true, pathDevDoc),
            build: buildConnect(serverPort, '*', true, false, false, pathBuildDoc)
        },
        watch: {
            sass: {
                files: ['sass/**/*.scss'],
                tasks: ['compass']
            },
            css: {
                files: [pathDevDoc + '**/*.css'],
                options: {
                    livereload: true
                }
            },
            scripts: {
                files: [pathDevDoc + 'js/**/*.js'],
                tasks: ['jshint:app'],
                options: {
                    interrupt: true
                }
            },
            jade: {
                files: ['jade/templates/**/*.jade', 'db/**/*.json'],
                tasks: ['jade:server'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    grunt.registerTask(
        'requirejs',
        'Run the r.js build script',
        function() {
            var done = this.async(),
                command = (os.platform() == 'win32') ? 'r.js.cmd' : 'r.js';
            exec(command + ' -o ./tools/build.js',
                function(err, stdout, stderr) {
                    if (err) {
                        grunt.fail.fatal('Problem with r.js: ' + err + ' ' + stderr);
                    }
                    grunt.log.writeln(stdout);
                    grunt.log.ok('Build complete.');
                    done();
                }
            );
        }
    );
    grunt.registerTask('default', ['clean:app', 'compass:app', 'jade', 'jshint:app']);
    grunt.registerTask('server', ['default', 'connect:dev', 'watch']);
    grunt.registerTask('build', ['default', 'requirejs']);
};

function buildJade(el, path, appUseJquery, appAddHtml5shiv, appAddFavicon, dados, debug) {
    var o = {
        'options': {
            'pretty': true,
            'data': {
                'path': path || '/',
                'useJquery': appUseJquery,
                'addHtml5shiv': appAddHtml5shiv,
                'addFavicon': appAddFavicon,
                'dados': dados,
                'debug': debug
            }
        },
        'files': {}
    };
    o.files['dev/Documents/app/' + el + '.txt'] = ['jade/templates/body.jade'];
    o.files['dev/Documents/app/' + el + '.html'] = ['jade/templates/index.jade'];
    return o;
}

function buildConnect(port, hostname, keepalive, livereload, debug, base, open) {
    var o = {
        'options': {
            'port': port || 9000,
            'hostname': hostname || '*',
            'keepalive': keepalive || false,
            'livereload': livereload || false,
            'debug': debug || false,
            'base': base,
            'open': open || 'http://localhost:' + port + '/server.html'
        }
    }
    return o;
}