import {browser, element, by} from 'protractor';

export class IndoorNaviPage {
  navigateToHome() {
    return browser.get('/');
  }

  getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  addComplex(name: string) {
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-add-button')).click();
  }

  removeLastComplex() {
    element.all(by.css('.complex-remove-button')).last().click();
  }

  editLastComplex(name: string) {
    element.all(by.css('.complex-edit-button')).last().click();
    element(by.id('new-complex-name-input')).clear();
    element(by.id('new-complex-name-input')).sendKeys(name);
    element(by.id('complex-edit-save-button')).click();
  }

  editLastComplexWithoutSaving(name: string) {
    element.all(by.css('.complex-edit-button')).last().click();
    element(by.id('new-complex-name-input')).clear();
    element(by.id('new-complex-name-input')).sendKeys(name);
  }

  cancelEditingLastComplex() {
    element(by.css('.cdk-overlay-container')).click();
  }

  getLatestAddedComplex() {
    return element.all(by.css('.complex-name')).last().getText();
  }

}
