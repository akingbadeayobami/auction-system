//jshint strict: false
module.exports = function(config) {
    config.set({

        basePath: './angular',

        files: [
            'assets/js/socket.io.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-socket-io/socket.min.js',
            'bower_components/angular-materialize/src/angular-materialize.js',
            'components/auction/auction-module.js',
            'components/auth/auth-module.js',
            'components/**/*.js',
            'components/**/*.html',
            'app.module.js'
        ],

        preprocessors: {
            "components/**/*.html": ["ng-html2js"]
        },


        ngHtml2JsPreprocessor: {
            stripPrefix: 'angular/',
            moduleName: "my.templates"
        },

        autoWatch: true,

        frameworks: ['mocha', 'chai'],

        browsers: ['Chrome'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
