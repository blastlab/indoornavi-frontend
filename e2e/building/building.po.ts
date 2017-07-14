import {browser, element, by, promise} from 'protractor';
import {ComplexPage} from '../complex/complex.po';

export class BuildingPage {
  static navigateToHome() {
    return browser.get('/');
  }

  static prepareAndOpenComplex(name: string) {
    BuildingPage.navigateToHome();
    ComplexPage.addComplex(name);
    ComplexPage.openLatestAddedComplex();
  }

  static destroyLastComplex() {
    ComplexPage.navigateToHome();
    ComplexPage.removeLastComplex();
    if (!!element(by.id('complex-confirm-remove-button'))) {
      element(by.id('complex-confirm-remove-button')).click();
    }
  }

  static addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  static removeLastBuilding() {
    element.all(by.css('.building-remove-button')).last().click();
  }

  static editLastBuilding(name: string, doSave: boolean) {
    element.all(by.css('.building-edit-button')).last().click();
    element(by.id('building-name-input')).clear();
    element(by.id('building-name-input')).sendKeys(name);
    if (doSave) {
      element(by.id('building-save-button')).click();
    }
  }

  static openLatestAddedBuilding() {
    return element.all(by.css('.building-floor-button')).last().click();
  }

  static getLatestAddedBuildingName() {
    return element.all(by.css('.building-name')).last().getText();
  }

}
