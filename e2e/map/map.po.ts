import {browser, element, by} from 'protractor';
import {FloorPage} from '../floor/floor.po';

export class MapPage {
  static prepareAndOpenFloor(name: string): void {
    FloorPage.prepareAndOpenBuilding(name);
    FloorPage.addFloor(name, 0);
    FloorPage.openLatestAddedFloor();
  }

  static destroyLastComplex() {
    FloorPage.destroyLastComplex();
  }
}
