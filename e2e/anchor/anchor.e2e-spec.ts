///<reference path="anchor.po.ts"/>
import {AppPage} from '../app.po';
import {AnchorPage} from './anchor.po';
import {ElementArrayFinder} from 'protractor';

describe('AnchorListComponent', () => {
  it('should have title', () => {
    AnchorPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Anchors');
  });

  it('should be able to add new anchor, edit it and then remove it', (done: DoneFn) => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';
    const newShortId = '321';

    AnchorPage.navigateToHome();
    AnchorPage.prepareToAddAnchor(shortId);

    AnchorPage.getRowsCount().then((initialRowsCount: number) => {

      AnchorPage.addAnchor(shortId, longId, name);

      AnchorPage.getRowsCount().then((afterAddCount: number) => {
        let row: ElementArrayFinder = AnchorPage.getLatestFromNotVerified();
        expect(row.get(0).getText()).toBe(shortId);
        expect(row.get(1).getText()).toBe(longId);
        expect(row.get(2).getText()).toBe(name);
        expect(afterAddCount).toBe(initialRowsCount + 1, 'After add count should be equal initial count + 1 (ADD)');

        AnchorPage.editLastAnchor(newShortId, longId, name, true);
        row = AnchorPage.getLatestFromNotVerified();
        expect(row.get(0).getText()).toBe(newShortId);
        expect(row.get(1).getText()).toBe(longId);
        expect(row.get(2).getText()).toBe(name);
        expect(afterAddCount).toBe(initialRowsCount + 1, 'After add count should be equal initial count + 1 (EDIT)');

        AnchorPage.removeAnchor(newShortId);
        AnchorPage.getRowsCount().then((afterRemoveCount: number) => {
          expect(afterRemoveCount).toBe(initialRowsCount, 'After add count should be equal initial count (REMOVE)');
          done();
        });
      });
    });
  });

  it('should cancel editing', () => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';
    const newShortId = '321';

    AnchorPage.navigateToHome();
    AnchorPage.prepareToAddAnchor(shortId);

    AnchorPage.addAnchor(shortId, longId, name);
    let row: ElementArrayFinder = AnchorPage.getLatestFromNotVerified();
    expect(row.get(0).getText()).toBe(shortId);
    expect(row.get(1).getText()).toBe(longId);
    expect(row.get(2).getText()).toBe(name);

    AnchorPage.editLastAnchor(newShortId, longId, name, false);
    AppPage.cancelEditingFromModal();

    row = AnchorPage.getLatestFromNotVerified();
    expect(row.get(0).getText()).toBe(shortId);
    expect(row.get(1).getText()).toBe(longId);
    expect(row.get(2).getText()).toBe(name);
  });

});
