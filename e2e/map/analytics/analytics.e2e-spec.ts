import {AnalyticsPage} from './analytics.po';
import {PublishedPage} from '../../published/published.po';

describe('Analytics', () => {
  it('should open Analytics, with toolbar and svg available', (done: DoneFn) => {
    PublishedPage.navigateToPublishedList();
    AnalyticsPage.openLastMapAnalytics();
    AnalyticsPage.countAnalyticalToolsButtons().then((numberOfButtons: number) => {
      expect(numberOfButtons).toBe(6);
      AnalyticsPage.checkForSvg().then((numberOfSvgs: number) => {
        expect(numberOfSvgs).toBeGreaterThanOrEqual(1);
        done();
      });
    });
  });
});
