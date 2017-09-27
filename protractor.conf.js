// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

const baseUrl =  'http://localhost:4200/';

exports.config = {
  useAllAngular2AppRoots: true,
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/scale.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['no-sandbox', 'start-maximized']
    }
  },
  directConnect: true,
  baseUrl: baseUrl,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },
  onPrepare() {
    // browser.driver.manage().window().maximize();
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

    browser.driver.get(baseUrl + 'login');

    browser.driver.findElement(by.id('user-name-input')).sendKeys('admin');
    browser.driver.findElement(by.id('user-password-input')).sendKeys('admin');
    browser.driver.findElement(by.id('login-button')).click();

    return browser.driver.wait(() => {
      return browser.driver.getCurrentUrl((url) => {
        return url.indexOf('/complexes') >= 0;
      });
    }, 5000);
  }
};
