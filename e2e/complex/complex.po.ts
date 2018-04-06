import {browser, by, element} from 'protractor';
import {Utils} from '../utils';

export class ComplexPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'complexes');
  }

  static addComplex(name: string) {
    element(by.id('new-complex-button')).click();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-save-button')).click();
  }

  static removeLastComplex() {
      element.all(by.css('.complex-removeObject-button')).last().click();
  }

  static editLastComplex(name: string, doSave: boolean) {
    element.all(by.css('.complex-edit-button')).last().click();
    element(by.id('complex-name-input')).clear();
    element(by.id('complex-name-input')).sendKeys(name);
    if (doSave) {
      element(by.id('complex-save-button')).click();
    }
  }

  static getLatestAddedComplexName() {
    return element.all(by.css('.complex-name')).last().getText();
  }

  static openLatestAddedComplex() {
    return element.all(by.css('.complex-building-button')).last().click();
  }

}
