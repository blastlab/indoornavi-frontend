import {browser, element, promise, by, protractor} from 'protractor';
import {Utils} from './utils';

export class AppPage {
  static getTitle() {
    Utils.waitForElement(element(by.css('app-root h1')));
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

  static getValidationErrors() {
    const ValidationError = element(by.className('validation-errors'));
    Utils.waitForElement(ValidationError);
    return ValidationError;
  }

  static getById(id: string) {
    return element(by.id(id));
  }

  static getByClass(className: string) {
    return element(by.className(className));
  }

  static getElementsCount(selector: string): promise.Promise<number> {
    return element.all(by.css(selector)).count();
  }

  static navigateBack() {
    browser.navigate().back();
  }

}
