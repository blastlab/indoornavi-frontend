import {AppPage} from '../app.po';
import {AnchorPage, TableRow} from './anchor.po';

describe('AnchorComponent', () => {
  it('should have title', () => {
    AnchorPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Anchors');
  });

  it('should be able to add new anchor', () => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';

    AnchorPage.navigateToHome();
    AnchorPage.addAnchor(shortId, longId, name);

    AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
      expect(anchorRow.shortId).toEqual(shortId);
      expect(anchorRow.longId).toEqual(longId);
      expect(anchorRow.name).toEqual(name);
    });

    AnchorPage.removeLastAnchor();
  });

  it('should be able to remove anchor', () => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';
    AnchorPage.navigateToHome();
    AnchorPage.getRowsCount().then((rowsCount: number) => {
      AnchorPage.addAnchor(shortId, longId, name);
      AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
        expect(anchorRow.shortId).toEqual(shortId);
      });

      AnchorPage.removeLastAnchor();
      expect(AnchorPage.getRowsCount()).toEqual(rowsCount);
    });
  });

  it('should be able to edit anchor', () => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';
    const newShortId = '321';

    AnchorPage.navigateToHome();
    AnchorPage.addAnchor(shortId, longId, name);
    AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
      expect(anchorRow.shortId).toEqual(shortId);
    });

    AnchorPage.editLastAnchor(newShortId, longId, name, true);
    AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
      expect(anchorRow.shortId).toEqual(newShortId);
    });

    AnchorPage.removeLastAnchor();
  });

  it('should cancel editing', () => {
    const shortId = '123';
    const longId = '12345';
    const name = 'name';
    const newShortId = '321';

    AnchorPage.navigateToHome();
    AnchorPage.addAnchor(shortId, longId, name);
    AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
      expect(anchorRow.shortId).toEqual(shortId);
    });

    AnchorPage.editLastAnchor(newShortId, longId, name, false);
    AppPage.cancelEditingFromModal();
    AnchorPage.getLatestFromNotVerified().then((anchorRow: TableRow) => {
      expect(anchorRow.shortId).toEqual(shortId);
    });
  });

});
