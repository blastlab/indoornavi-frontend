import {element, by, promise} from 'protractor';
import {BuildingPage} from '../building/building.po';

export class FloorPage {
  static prepareAndOpenBuilding(name: string) {
    BuildingPage.prepareAndOpenComplex(name);
    BuildingPage.addBuilding(name);
    BuildingPage.openLatestAddedBuilding();
  }

  static destroyLastComplex() {
    BuildingPage.destroyLastComplex();
  }

  static addFloor(name: string, level: number): void {
    element(by.id('new-floor-button')).click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    element(by.id('floor-save-button')).click();
  }

  static removeLastFloor(): void {
    element.all(by.css('.floor-remove-button')).last().click();
  }

  static editLastFloor(name: string, level: number, doSave: boolean) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    if (doSave) {
      element(by.id('floor-save-button')).click();
    }
  }

  static getLatestAddedFloorName(): promise.Promise<string> {
    return element.all(by.css('.floor-name')).last().getText();
  }

  static getLatestAddedFloorLevel(): promise.Promise<string> {
    return element.all(by.css('.floor-level')).last().getText();
  }

  static openLatestAddedFloor(): promise.Promise<void> {
    return element.all(by.css('.floor-map-button')).last().click();
  }

}
