import {browser, element, by, promise} from 'protractor';
import {ComplexPage} from '../complex/complex.po';

export class BuildingPage {
  static navigateToHome() {
    return browser.get('/');
  }

  static prepareComplex(name: string) {
    BuildingPage.navigateToHome();
    ComplexPage.addComplex(name);
    ComplexPage.openLatestAddedComplex();
  }

  static getBackUrl(url: string): string {
    url = url.substring(url.indexOf('//') + 2, url.lastIndexOf('/'));
    url = url.substring(url.indexOf('/'), url.lastIndexOf('/') + 1);
    console.log(url);
    return url;
  }

  static destroyLastComplex() {
    ComplexPage.removeLastComplex();
    ComplexPage.editLastComplex('cleaning', false);
  }

  static addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  static getBuildingsCount(): promise.Promise<number> {
    return element.all(by.css('tr.building')).count();
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

  static getLatestAddedBuilding() {
    return element.all(by.css('.building-name')).last().getText();
  }

}
