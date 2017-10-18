import {AnalyticsPage} from './analytics.po';
import {browser} from 'protractor';
import {PublishedPage} from '../../published/published.po';

describe('Analytics', () => {
  it('should open Analytics, with toolbar and svg available', (done: DoneFn) => {
    PublishedPage.navigateToPublishedList();
    AnalyticsPage.openLastMapAnalytics();
    browser.sleep(2000); // wait till browser will reload page
    AnalyticsPage.countAnalyticalToolsButtons().then((numberOfButtons: number) => {
      expect(numberOfButtons).toBe(6);
    });
    AnalyticsPage.checkForSvg().then((numberOfSvgs: number) => {
      expect(numberOfSvgs).toBeGreaterThanOrEqual(1);
    });
    done();
  });
});
