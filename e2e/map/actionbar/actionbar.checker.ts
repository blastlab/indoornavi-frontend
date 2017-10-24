import {browser, by, element} from 'protractor';
import {AppPage} from '../../app.po';

export class ActionBarChecker {
  static expectButtonsToBeInProperStateBeforeAndAfter(before: ButtonState[],
                                                      action: () => void,
                                                      waitForPublishButtonToBe: string,
                                                      after: ButtonState[]) {
    before.forEach((b) => {
      expect(element(by.id(b.id)).getAttribute('disabled')).toEqual(b.disabled);
    });

    action();

    browser.wait(function () {
      return AppPage.getById('publish').getAttribute('disabled').then(function (value) {
        return value === waitForPublishButtonToBe;
      });
    }, 10000);

    after.forEach((a) => {
      expect(element(by.id(a.id)).getAttribute('disabled')).toEqual(a.disabled);
    });
  }
}

export interface ButtonState {
  id: string;
  disabled: string;
}
