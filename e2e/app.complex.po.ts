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

  removeComplex(index: number) {
    element.all(by.css('.complex-remove-button')).get(index).click();
  }

  editComplex(index: number, name: string) {
    element.all(by.css('.complex-edit-button')).get(index).click();
    element(by.id('complex-name-input')).clear();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-edit-save-button')).click();
  }

  getLatestAddedComplex() {
    return element.all(by.css('.complex-name')).last().getText();
  }

}
