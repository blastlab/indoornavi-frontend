import {AppPage} from '../app.po';
import {TagPage} from './tag.po';
import {ElementArrayFinder} from 'protractor';

describe('TagComponent', () => {
  it('should have title', () => {
    TagPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Tags');
  });

  it('should be able to add new tag, edit it and then remove it', (done: DoneFn) => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';
    const newShortId = '101';

    TagPage.navigateToHome();
    TagPage.prepareToAddTag(shortId);

    TagPage.getRowsCount().then((initialCount: number) => {
      TagPage.addTag(shortId, longId, name);

      TagPage.getRowsCount().then((afterAddCount: number) => {
        let row: ElementArrayFinder = TagPage.getLatestFromNotVerified();
        expect(row.get(0).getText()).toBe(shortId);
        expect(row.get(1).getText()).toBe(longId);
        expect(row.get(2).getText()).toBe(name);
        expect(afterAddCount).toBe(initialCount + 1);

        TagPage.editLastTag(newShortId, longId, name, true);
        row = TagPage.getLatestFromNotVerified();
        expect(row.get(0).getText()).toBe(newShortId);
        expect(row.get(1).getText()).toBe(longId);
        expect(row.get(2).getText()).toBe(name);
        expect(afterAddCount).toBe(initialCount + 1);

        TagPage.removeTag(newShortId);

        TagPage.getRowsCount().then((afterRemoveCount: number) => {
          expect(afterRemoveCount).toBe(initialCount);
          done();
        });
      });
    });
  });

  it('should cancel editing', () => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';
    const newShortId = '101';

    TagPage.navigateToHome();
    TagPage.prepareToAddTag(shortId);

    TagPage.addTag(shortId, longId, name);
    let row: ElementArrayFinder = TagPage.getLatestFromNotVerified();
    expect(row.get(0).getText()).toBe(shortId);
    expect(row.get(1).getText()).toBe(longId);
    expect(row.get(2).getText()).toBe(name);

    TagPage.editLastTag(newShortId, longId, name, false);
    AppPage.cancelEditingFromModal();
    row = TagPage.getLatestFromNotVerified();
    expect(row.get(0).getText()).toBe(shortId);
    expect(row.get(1).getText()).toBe(longId);
    expect(row.get(2).getText()).toBe(name);
  });

});
