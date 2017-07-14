import {protractor, browser, ElementArrayFinder, ElementFinder} from 'protractor';

export module Utils {

  export function waitForElements(elements: ElementArrayFinder) {
    const EC = protractor.ExpectedConditions;

    elements.each((elem: ElementFinder) => {
      browser.wait(EC.presenceOf(elem));
    });
  }

  export function waitForElement(element: ElementFinder) {
    const EC = protractor.ExpectedConditions;
    browser.wait(EC.presenceOf(element));
  }
}
