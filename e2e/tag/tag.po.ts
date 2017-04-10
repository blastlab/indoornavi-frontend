import {element, by, browser, promise} from 'protractor';
import {Utils} from '../utils';

export class TagPage {
  static navigateToHome() {
    return browser.get('/tags');
  }

  static addTag(shortId: string, longId: string, name: string) {
    element(by.id('new-tag-button')).click();
    element(by.id('device-short-id')).sendKeys(shortId);
    element(by.id('device-long-id')).sendKeys(longId);
    element(by.id('device-name')).sendKeys(name);
    element(by.id('save-button')).click();
  }

  static getLatestFromNotVerified(): Promise<TableRow> {
    const row = element.all(by.css('#notVerifiedList tr')).last().all(by.tagName('td'));

    return new Promise((resolve) => {
      Utils.waitForElements(row);
      resolve({
        shortId: row.get(0).getText(),
        longId: row.get(1).getText(),
        name: row.get(2).getText()
      });
    });
  }

  static getRowsCount(): promise.Promise<number> {
    return element.all(by.css('#notVerifiedList tr')).count();
  }

  static removeLastTag() {
    element.all(by.css('#notVerifiedList tr')).last().element(by.className('remove-button')).click();
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
