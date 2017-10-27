import {protractor, browser, ElementArrayFinder, ElementFinder, element, by} from 'protractor';
import * as fs from 'fs';

export module Utils {
  export const baseUrl = 'http://localhost:4200/';

  export function waitForElements(elements: ElementArrayFinder) {
    const EC = protractor.ExpectedConditions;

    elements.each((elem: ElementFinder) => {
      browser.wait(EC.presenceOf(elem));
    });
  }

  export function waitForElement(elem: ElementFinder) {
    const EC = protractor.ExpectedConditions;
    browser.wait(EC.presenceOf(elem));
  }

  export function getScreenshots(testFileName: string) {
    const time = Date.now();
    function writeScreenShot(data, filename) {
      const stream = fs.createWriteStream(filename);
      stream.write(new Buffer(data, 'base64'));
      stream.end();
    }
    browser.takeScreenshot().then(function (png) {
      writeScreenShot(png, `${testFileName}_${time}_test.png`);
    })
  }

  export function getUsersCount() {
    const tr = element.all(by.tagName('tr'));
    Utils.waitForElement(tr.first());
    return tr.count();
  }
}
