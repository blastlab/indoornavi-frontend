import {AnalyticsPage} from './analytics.po';
import {AppPage} from '../../app.po';
import {browser} from 'protractor';

describe('Analytics', () => {

  it('should open published maps list', () => {
    AnalyticsPage.navigateToPublishedList();
    expect(AppPage.getTitle()).toBe('Published maps');
  });

  it('open analytics, set heat values, start and than stop heatmap', (done: DoneFn) => {
    // first we need to create floor with uploaded image and scale set
    const elementName = 'Published Map Test Floor';
    AnalyticsPage.openLastMapAnalytics();
    browser.sleep(3000);

    done();

  });
});
