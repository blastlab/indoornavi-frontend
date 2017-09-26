import {browser, by, element, ElementArrayFinder, promise} from 'protractor';
import {Utils} from '../utils';

export class TagPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'tags');
  }

  static prepareToAddTag(shortId: string) {
    // first, we check that tag with shortId already exists, if so we remove him
    element(by.id('remove-' + shortId)).isPresent().then((isPresent: boolean) => {
      if (isPresent) {
        element(by.id('remove-' + shortId)).click();
      }
    });
  }

  static addTag(shortId: string, longId: string, name: string) {
    element(by.id('new-device-button')).click();
    element(by.id('device-short-id')).sendKeys(shortId);
    element(by.id('device-long-id')).sendKeys(longId);
    element(by.id('device-name')).sendKeys(name);
    element(by.id('save-button')).click();
  }

  static getLatestFromNotVerified(): ElementArrayFinder {
    return element.all(by.css('#notVerifiedList tr')).last().all(by.tagName('td'));
  }

  static getRowsCount(): promise.Promise<number> {
    return element.all(by.css('#notVerifiedList tr')).count();
  }

  static removeTag(shortId: string) {
    element(by.id('remove-' + shortId)).click();
  }

  static editLastTag(shortId: string, longId: string, name: string, doSave: boolean) {
    element.all(by.css('#notVerifiedList tr')).last().element(by.className('edit-button')).click();
    element(by.id('device-short-id')).clear();
    element(by.id('device-short-id')).sendKeys(shortId);
    element(by.id('device-long-id')).clear();
    element(by.id('device-long-id')).sendKeys(longId);
    element(by.id('device-name')).clear();
    element(by.id('device-name')).sendKeys(name);
    if (doSave) {
      element(by.id('save-button')).click();
    }
  }

}

export interface TableRow {
  shortId: promise.Promise<string>;
  longId: promise.Promise<string>;
  name?: promise.Promise<string>;
}
