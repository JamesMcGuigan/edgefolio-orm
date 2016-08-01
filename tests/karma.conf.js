/**
 *  Karma Config Docs
 *    https://karma-runner.github.io/0.12/config/configuration-file.html
 */
/**

 README.md

 ## Testing

 Config Files
 - [tests/karma.conf.js](tests/karma.conf.js)
 - [tests/protractor.conf.js](tests/protractor.conf.js)
 - [gulp/tasks/test-unit.js](gulp/tasks/test-unit.js)
 - [gulp/tasks/test-e2e.js](gulp/tasks/test-e2e.js)

 Gulp command line (does all required build steps before running):
 ```bash
 gulp test-unit   // unit tests only, in --single-run mode
 gulp test-e2e    // selenium/protractor tests
 gulp test        // run unit test then e2e tests;
 ```

 Gulp command line arguments:
 ```bash
 gulp test-e2e --host=http://edgefolio-development.com # defaults to edgefolio-local.com
 gulp test-e2e  --chrome --firefox # --opera --safari --ie --phantomjs flags are broken
 gulp test-unit --chrome --firefox # --opera --safari --ie --phantomjs flags are broken
 ```

 Running combined karma server and gulp build/watch - alternatively run gulp and karma separate tabs
 ```
 gulp watch-test-unit  // run karma server, with gulp pre-build and file watchers
 gulp watch-test-e2e   // unsure if
 gulp watch-test       // run both test watchers - not sure if this is useful
 ```

 Running karma directly in watch modes (startup suffers 60s timeout to detect browser if not in --single-run mode)
 ```
 gulp                                          # manually run gulp in the background
 karma start tests/karma.conf.js               # run in watch mode without coverage, interferes with Chrome debugging
 karma start tests/karma.conf.js --single-run  # run once (fast) with PhantomJS and coverage
 karma start tests/karma.conf.js --phantomjs --chrome --firefox --safari --opera --ie  # browser select, not all supported

 karma start tests/karma.conf.js --ansible     # deployment mode: run with PhantomJS mode but text coverage output
 karma start tests/karma.conf.js --teamcity    # single-run with teamcity output | QUESTION: how is this configured
 karma start tests/karma.conf.js --production  # test against production javascript, currently broken
 karma start tests/karma.conf.js --staging     # test against staging javascript, currently broken

 karma start tests/karma.conf.js --failing     # additionally run *.spec.failing.js and *.spec.broken.js tests

 # NOTE: minimum requirements: gulp includes-json # for running all tests
 # NOTE: minimum requirements: gulp production OR gulp staging before running with --production or --staging flags
 ```



 #### Test Debugging
 ```
 karma start tests/karma.conf.js
 open http://localhost:9877/debug.html  # or wait for karma to auto open browser and click debug button
 # cmd-alt-I open Chrome developer tools
 # set breakpoint either in tests or code
 # cmd-R to refresh the page and rerun tests
 # Chrome debugging only needs karma server to be running, even if set to PhantomJS mode (except it doesn't open browser for you)
 # Command-click can open weblinks echoed to OSX terminal
 ```

**/

var _       = require('lodash');
var fs      = require('fs');
var path    = require('path');

//var karmaConfigDefaults = {
//  LOG_DISABLE: 'OFF',
//  LOG_ERROR: 'ERROR',
//  LOG_WARN: 'WARN',
//  LOG_INFO: 'INFO',
//  LOG_DEBUG: 'DEBUG',
//  set: function() {},
//  frameworks: [],
//  port: 9876,
//  hostname: 'localhost',
//  basePath: '',
//  files: [],
//  exclude: [],
//  logLevel: 'INFO',
//  colors: true,
//  autoWatch: true,
//  autoWatchBatchDelay: 250,
//  usePolling: true,
//  reporters: [ 'progress' ],
//  singleRun: false,
//  browsers: [],
//  captureTimeout: 60000,
//  proxies: {},
//  proxyValidateSSL: true,
//  preprocessors: {},
//  urlRoot: '/',
//  reportSlowerThan: 0,
//  loggers: [ { type: 'console', layout: { type: 'pattern', pattern: '%[%p [%c]: %]%m' }, makers: { console: function() {} }} ],
//  transports: [ 'websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling' ],
//  plugins: [ 'karma-*' ],
//  client: { args: [], useIframe: true, captureConsole: true },
//  defaultClient: { args: [], useIframe: true, captureConsole: true },
//  browserDisconnectTimeout: 2000,
//  browserDisconnectTolerance: 0,
//  browserNoActivityTimeout: 10000
//};


// getKarmaConfig() is also accessed from webapps/gulp/tasks/test.js
function getKarmaConfig() {
  var basepath = path.join(__dirname, '../');
  var includesJSON = {
    "models": JSON.parse(fs.readFileSync(path.join(__dirname, '../edgefolio-models-includes.json')).toString())
  };

  // --staging, --production command line flagscurrently broken as we can't exclude src/manager_app/angular/config/routes/**.js yet
  var includesFiles;
  if( _(process.argv).contains('--production') ) {
    includesFiles = [
      _(includesJSON).keys().map(function(appName) { return 'src/production/edgefolio-'+appName+'-js-libs.min.js' }).value(),
      _(includesJSON).keys().map(function(appName) { return 'src/production/edgefolio-'+appName+'-js-code.min.js' }).value()
    ];
  } else if( _(process.argv).contains('--staging') ) {
    includesFiles = [
      _(includesJSON).keys().map(function(appName) { return 'src/production/edgefolio-'+appName+'-js-libs.js' }).value(),
      _(includesJSON).keys().map(function(appName) { return 'src/production/edgefolio-'+appName+'-js-code.js' }).value()
    ];
  } else {
    includesFiles = [
      _(includesJSON).values().pluck("libs").value(),
      _(includesJSON).values().pluck("code").value()
    ];
  }
  includesFiles = _([])
    .concat(includesFiles)
    .flatten(true)
    .unique()
    .concat('tests/chai.conf.js')
    .concat('libs/bower_components/angular-mocks/angular-mocks.js')
    .concat('libs/bower_components/karma-read-json/karma-read-json.js')
    .concat({ pattern: 'tests/**/*.json', included: false }) // needed to get readJSON to work
    .concat('tests/unit-preload/**/*.js')
    .concat('src/**/*.spec.js')
    .value();

  if( _(process.argv).contains('--failing') || _(process.argv).contains('--broken') ) {
    includesFiles = includesFiles.concat('src/**/*.spec.*.js')
  }

  // Standardize file paths
  includesFiles = _.map(includesFiles, function(filename) {
    return _.isString(filename) ? filename.replace(basepath, '') : filename;
  });

  var config = {
    // Files and Paths
    basePath: basepath,  // base path that will be used to resolve all patterns (eg. files, exclude)
    files:    includesFiles,
    exclude: [
      'tests/unit-preload/unused/**/*.js',
      'libs/bower_components/**/*.spec.js',
      'src/jspm_packages/**/*.spec.js',
      'node_modules/**/*.spec.js',
      //'src/manager_app/angular/routes/**.js', // MA Routing requires preconfiguring many API routes
      //'src/investor_app/angular/routes/**.js', // MA Routing requires preconfiguring many API routes
      //'src/common_components/angular/decorators/ui-router-state-decorator.js',
      //'src/manager_app/angular/config/routes/account-setup-redirects.js',
      //'src/manager_app/angular-archive/**/*.spec.js',
      '**/*.bak/**/*',
      '**/*.wip.*'
    ],
    proxies: {
      '/api/': 'https://edgefolio-local.com/api/' // ngMockE2E::$http.whenGET().passThrough() broken
    },

    // List of available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    // NOTE: framework dependencies loaded in reverse order
    frameworks: [
      'mocha',
      'sinon-chai',
      'sinon',
      'chai-jquery', 'jquery-2.1.0',
      'chai-things',
      'chai-as-promised',
      'chai' // parent dependency at bottom of list
    ],

    // This list does not activate the plugins, just loads npm packages into namespace
    plugins: [
      'karma-*'

      ////// Assertions
      //'karma-chai',
      //'karma-jquery',
      //'karma-chai-jquery',
      //'karma-chai-things',
      //'karma-chai-as-promised',
      //'karma-sinon',
      //'karma-sinon-chai',
      //'karma-sinon',
      //
      ////// Karma Plugins
      //'karma-mocha',
      //'karma-jasmine',
      //
      ////// Reporters
      //'karma-coverage',
      //'karma-jenkins-reporter',
      //'karma-growl-reporter',
      //'karma-mocha-reporter',
      //
      ////// Browser Launchers
      //'karma-chrome-launcher',
      //'karma-firefox-launcher',
      //'karma-ie-launcher',
      //'karma-opera-launcher',
      //'karma-phantomjs-launcher',
      //'karma-safari-launcher'
      //
      ////// Code Transformers
      //// 'karma-browserify',
    ],

    preprocessors: {
      //'src/manager_app/**/*.js':       ['coverage'],
      'src/investor_app/**/*.js':      ['coverage'],
      'src/common_components/**/*.js': ['coverage'],
      'src/enterprise/**/*.js':        ['coverage']
    },

    reporters: ['growl', 'mocha'], // ['dots', 'coverage', 'teamcity'], available reporters: https://npmjs.org/browse/keyword/karma-reporter

    mochaReporter: {
      output: 'full'
    },

    // enable
    coverageReporter: {
      reporters: [
        //{ type: 'text' },
        //{ type: 'html', dir: 'tests/_output/coverage/' }
      ]
    },
    jenkinsReporter: {
      outputFile:      'tests/_output/jenkins/unit-test.xml',
      suite:           'webapps',      // this will be mapped to the package
      classnameSuffix: 'browser-test'
    },
    // captureTimeout:   30000, // browser capture timeout, max 3 attempts, first attempt always fails - needs 60s
    reportSlowerThan: 1000,  // report any test taking longer than 1s, may need adjusting
    // browserNoActivityTimeout: 30000,
    // browserDisconnectTimeout: 10000,

    logLevel: 'INFO', // possible values: config.LOG_DISABLE: 'OFF', config.LOG_ERROR: 'ERROR', config.LOG_WARN: 'WARN', config.LOG_INFO: 'INFO', config.LOG_DEBUG: 'DEBUG',

    // Settings
    port:      9876,
    browsers:  [],               // ['PhantomJS', 'Chrome', 'ChromeCanary', 'Firefox', 'Safari', 'Opera', 'Internet Explorer'], available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    colors:    true,
    autoWatch: true,             // enable / disable watching file and executing tests whenever any file changes
    singleRun: false             // karma start tests/karma.conf.js --single-run to run tests once without watch
  };


  //// Command line arguments configuration

  // --ansible command line flag - only use PhantomJS, disable html coverage
  if( _(process.argv).contains('--ansible') ) {
    config.browsers  = ['PhantomJS'];
    config.coverageReporter.reporters = _.reject(config.coverageReporter.reporters, { type: 'text'});
    config.reporters.push('jenkins');
  }
  // Enable coverage for single-run mode - it interferes with debugging
  else if( config.singleRun || _(process.argv).contains('--single-run') ) {
    config.browsers = ['PhantomJS'];
    config.reporters.push('coverage');
    //config.coverageReporter.reporters.push({ type: 'text' });
    config.coverageReporter.reporters.push({ type: 'html', dir: 'tests/_output/coverage/' })
  }
  else {
    console.info("PRO TIP: open http://localhost:9876/debug.html then set breakpoints and refresh page for debugging - cmd-click to open link");
  }

  _.forIn({
    Chrome:  '--chrome',
    Firefox: '--firefox',
    Safari:  '--safari',
    Opera:   '--opera',
    'Internet Explorer': '--ie',
    PhantomJS: '--phantomjs'
  }, function(flag, browser) {
    if( _(process.argv).contains(flag) ) {
      config.browsers.push(browser);
    }
  });
  if( config.browsers.length === 0 ) {
    config.browsers = ["PhantomJS"];
  }

  if( _(process.argv).contains('--config') ) {
    console.log("karma.conf.js::getKarmaConfig", "config", JSON.stringify(config, null, 2));
  }
  return _.cloneDeep(config);
}

module.exports = function(config) {
  // console.info("karma.conf.js:134", "karmaConfigDefaults", config);

  // NOTE: config.set() can be called multiple times and properties can be read as simple key/value pairs: if( config.singleRun ) {}
  config.set(getKarmaConfig());
};
module.exports.getKarmaConfig = getKarmaConfig;
