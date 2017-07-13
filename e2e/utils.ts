import {browser, by, element, ElementArrayFinder, ElementFinder, protractor} from 'protractor';

export module Utils {
  export const baseUrl = 'http://localhost:4200/';

  export function waitForToastToDisappear(func: () => void) {
    const EC = protractor.ExpectedConditions;
    const el = element(by.css('.cdk-global-overlay-wrapper'));

    browser.wait(EC.not(EC.presenceOf(el))).then(() => {
      func();
    });
  }

  export function waitForElements(elements: ElementArrayFinder) {
    const EC = protractor.ExpectedConditions;

    elements.each((elem: ElementFinder) => {
      browser.wait(EC.presenceOf(elem));
    });
  }
}
