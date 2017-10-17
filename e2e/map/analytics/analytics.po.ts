import {browser, by, element, promise as protractorPromise} from 'protractor';


export class AnalyticsPage {
  static openLastMapAnalytics(): void {
    element.all(by.className('analytics')).last().click();
  }
  static countAnalyticalToolsButtons(): protractorPromise.Promise<number> {
    return element(by.className('analytics-toolbar')).all(by.css('button')).count();
  }
  static checkForSvg(): protractorPromise.Promise<number> {
    return element.all(by.css('svg')).count();
  }
}
