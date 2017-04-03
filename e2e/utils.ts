import {element, by, protractor, browser, ElementArrayFinder, ElementFinder} from 'protractor';

export module Utils {
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
