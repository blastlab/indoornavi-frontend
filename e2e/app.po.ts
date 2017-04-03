import {element, by} from 'protractor';

export class AppPage {
  static getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  static cancelEditingFromModal() {
    element(by.css('.cdk-overlay-container')).click();
  }
}
