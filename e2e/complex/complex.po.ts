import {browser, element, by, promise} from 'protractor';
import {Utils} from '../utils';

export class ComplexPage {
  static navigateToHome() {
    return browser.get('/complexes');
  }

  static addComplex(name: string) {
    element(by.id('new-complex-button')).click();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-save-button')).click();
  }

  static removeLastComplex() {
    Utils.waitForToastToDisappear(() => {
      element.all(by.css('.complex-remove-button')).last().click();
    });
  }

  static editLastComplex(name: string, doSave: boolean) {
    element.all(by.css('.complex-edit-button')).last().click();
    element(by.id('complex-name-input')).clear();
    element(by.id('complex-name-input')).sendKeys(name);
    if (doSave) {
      element(by.id('complex-save-button')).click();
    }
  }

  static getComplexesCount(): promise.Promise<number> {
    return element.all(by.css('tr.complex')).count();
  }

  static getLatestAddedComplex() {
    return element.all(by.css('.complex-name')).last().getText();
  }

  static openLatestAddedComplex() {
    return element.all(by.css('.complex-building-button')).last().click();
  }

}
