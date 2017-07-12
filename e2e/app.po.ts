import {browser, element, promise, by, protractor} from 'protractor';

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

  static navigateTo(path: string) {
    return browser.get(path);
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

}
