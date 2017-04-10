import {AppPage} from '../app.po';
import {TagPage, TableRow} from './tag.po';

describe('TagComponent', () => {
  it('should have title', () => {
    TagPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Tags');
  });

  it('should be able to add new tag', () => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';

    TagPage.navigateToHome();
    TagPage.addTag(shortId, longId, name);

    TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
      expect(tagRow.shortId).toEqual(shortId);
      expect(tagRow.longId).toEqual(longId);
      expect(tagRow.name).toEqual(name);
    });

    TagPage.removeLastTag();
  });

  it('should be able to remove tag', () => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';
    TagPage.navigateToHome();
    TagPage.getRowsCount().then((rowsCount: number) => {
      TagPage.addTag(shortId, longId, name);
      TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
        expect(tagRow.shortId).toEqual(shortId);
      });

      TagPage.removeLastTag();
      expect(TagPage.getRowsCount()).toEqual(rowsCount);
    });
  });

  it('should be able to edit tag', () => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';
    const newShortId = '101';

    TagPage.navigateToHome();
    TagPage.addTag(shortId, longId, name);
    TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
      expect(tagRow.shortId).toEqual(shortId);
    });

    TagPage.editLastTag(newShortId, longId, name, true);
    TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
      expect(tagRow.shortId).toEqual(newShortId);
    });

    TagPage.removeLastTag();
  });

  it('should cancel editing', () => {
    const shortId = '100';
    const longId = '10000';
    const name = 'name';
    const newShortId = '101';

    TagPage.navigateToHome();
    TagPage.addTag(shortId, longId, name);
    TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
      expect(tagRow.shortId).toEqual(shortId);
    });

    TagPage.editLastTag(newShortId, longId, name, false);
    AppPage.cancelEditingFromModal();
    TagPage.getLatestFromNotVerified().then((tagRow: TableRow) => {
      expect(tagRow.shortId).toEqual(shortId);
    });
  });

});
