import {element, by} from 'protractor';
import {FloorPage} from '../floor/floor.po';
import {Utils} from '../utils';

export class MapPage {
  static prepareAndOpenFloor(name: string): void {
    FloorPage.prepareAndOpenBuilding(name);
    FloorPage.addFloor(name, 0);
    FloorPage.openLatestAddedFloor();
  }

  static destroyLastComplex() {
    FloorPage.destroyLastComplex();
  }

  static uploadFile(fileName: string): void {
    const path = require('path');
    const file = '../resources/' + fileName;
    const absolutePath = path.resolve(__dirname, file);
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
  }

  static waitForElement(elem: string) {
    Utils.waitForElement(element(by.css(elem)));
  }

  static getUploader() {
    return element(by.css('input[type="file"]'));
  }

}
