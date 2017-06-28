import {browser, element, by, protractor} from 'protractor';

export class AppPage {
  static getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  static getCurrentUrl() {
    return browser.getCurrentUrl().then(url => {
      return url;
    });
  }

  static cancelEditingFromModal() {
    element(by.css('.cdk-overlay-container')).click();
  } // clicks on random coordinates (sometimes misses)

  static cancelEditingWithESC() {
    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
  }
}
