//jshint strict: false
exports.config = {

  allScriptsTimeout: 11000,

  specs: [
    '*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8000/',

  framework: 'mocha',

  mochaOpts: {
    reporter: "spec",
    slow: 3000,
    ui: 'bdd',
    timeout: 30000
  },

  onPrepare: function() { // making chai available globally. in your test use `const expect = global['chai'].expect;`
     var chai = require('chai');
     var chaiAsPromised = require("chai-as-promised");
     chai.use(chaiAsPromised);
     global.chai = chai;
   }

};
