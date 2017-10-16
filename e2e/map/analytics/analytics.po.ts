import {browser, by, element, promise as protractorPromise} from 'protractor';
import {Utils} from '../../utils';

export class AnalyticsPage {
  static navigateToPublishedList() {
    return browser.get(Utils.baseUrl + 'maps');
  }
  static openLastMapAnalytics() {
    element.all(by.className('analytics')).last().click();
  }
}
