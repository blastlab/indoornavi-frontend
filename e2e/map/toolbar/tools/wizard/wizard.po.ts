import {element, by} from 'protractor';
import {MapPage} from '../../../map.po';

export class WizardTool {

  static prepareMap(name: string) {
    MapPage.prepareAndOpenFloor(name);
    MapPage.uploadFile('map.jpg');
  }

  static destroyLastComplex() {
    MapPage.destroyLastComplex();
  }

  static clickWizardTool() {
    element(by.className('wizard-button')).click();
  }

  static getDialogContent() {
    return element(by.className('cdk-focus-trap-content'));
  }

}
