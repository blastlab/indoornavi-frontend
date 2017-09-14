// import {browser, by, element, promise} from 'protractor';
// import {Utils} from '../utils';
//
// export class AnchorPage {
//
//   static prepareToAddAnchor(shortId: string) {
//     // first, we check that anchor with shortId already exists, if so we remove him
//     element(by.id('remove-' + shortId)).isPresent().then((isPresent: boolean) => {
//       if (isPresent) {
//         element(by.id('remove-' + shortId)).click();
//       }
//     });
//   }
//
//   static addAnchor(shortId: string, longId: string, name: string) {
//     element(by.id('new-anchor-button')).click();
//     element(by.id('device-short-id')).sendKeys(shortId);
//     element(by.id('device-long-id')).sendKeys(longId);
//     element(by.id('device-name')).sendKeys(name);
//     element(by.id('save-button')).click();
//   }
//
//   static navigateToHome() {
//     return browser.get(Utils.baseUrl + 'anchors');
//   }
//
//   static getLatestFromNotVerified() {
//     return element.all(by.css('#notVerifiedList tr')).last().all(by.tagName('td'));
//   }
//
//   static getRowsCount(): promise.Promise<number> {
//     return element.all(by.css('#notVerifiedList tr')).count();
//   }
//
//   static removeAnchor(shortId: string) {
//     element(by.id('remove-' + shortId)).click();
//   }
//
//   static editLastAnchor(shortId: string, longId: string, name: string, doSave: boolean) {
//     element.all(by.css('#notVerifiedList tr')).last().element(by.className('edit-button')).click();
//     element(by.id('device-short-id')).clear();
//     element(by.id('device-short-id')).sendKeys(shortId);
//     element(by.id('device-long-id')).clear();
//     element(by.id('device-long-id')).sendKeys(longId);
//     element(by.id('device-name')).clear();
//     element(by.id('device-name')).sendKeys(name);
//     if (doSave) {
//       element(by.id('save-button')).click();
//     }
//   }
//
// }
