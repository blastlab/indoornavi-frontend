import {by, element} from 'protractor';

export class AppPage {
  static getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  static cancelEditingFromModal() {
    element(by.css('.cdk-overlay-container')).click();
  }

  static getValidationErrors() {
    return element(by.className('validation-errors'));
  }

  static getToast() {
    return element(by.className('mat-simple-snackbar-message'));
  }
}
