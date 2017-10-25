import {browser, by, element, promise} from 'protractor';
import {MapPage} from '../../../map.po';
import {Utils} from '../../../../utils';
import {ILocation} from 'selenium-webdriver';

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

  static waitForElement(elem: string) {
    Utils.waitForElement(element(by.css(elem)));
  }

  static openSelectChoices() {
    element.all(by.css('.dialog-select md-select.mat-select')).first().click();
  }

  static chooseFirstSelectOption() {
    Utils.waitForElements(element.all(by.css('md-option')));
    element.all(by.css('md-option')).first().click();
  }

  static clickOnMap(coords: ILocation) {
    // coords.y += 1;  // instructions below are read by d3.event like is has been clicked 1px higher (only y axis).
    browser.actions()
      .mouseMove(element(by.id('map')), coords)
      .click().perform();
  }

  static dragElementBy(elementBeingDragged, translation) {
    browser.actions()
      .mouseDown(elementBeingDragged).mouseMove(translation).mouseUp()
      .perform();
  }

  static clickDecisionButton(accept: boolean) {
    const decision = (accept) ? 'positive' : 'negative';
    element.all(by.css('.decision.' + decision)).first().click();
  }

}
