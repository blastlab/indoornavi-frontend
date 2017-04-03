import {browser, element, by} from 'protractor';
import {Utils} from '../utils';

export class ComplexPage {
  static navigateToHome() {
    return browser.get('/complexes');
  }

  static addComplex(name: string) {
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-add-button')).click();
  }

  static removeLastComplex() {
    Utils.waitForToastToDisappear(() => {
      element.all(by.css('.complex-remove-button')).last().click();
    });
  }

  static editLastComplex(name: string, doSave: boolean) {
    element.all(by.css('.complex-edit-button')).last().click();
    element(by.id('new-complex-name-input')).clear();
    element(by.id('new-complex-name-input')).sendKeys(name);
    if (doSave) {
      element(by.id('complex-edit-save-button')).click();
    }
  }

  static cancelEditingLastComplex() {
    element(by.css('.cdk-overlay-container')).click();
  }

  static getLatestAddedComplex() {
    return element.all(by.css('.complex-name')).last().getText();
  }

}
