import {ComplexPage} from './complex.po';
import {AppPage} from '../app.po';

describe('ComplexComponent', () => {

  beforeAll(() => {
    ComplexPage.navigateToHome();
  });

  it('should have title', () => {
    expect(AppPage.getTitle()).toEqual('Your building complexes');
  });

  it('...be able to add new, edit, cancel editing, open (then go back) and remove complex', (done: DoneFn) => {
    const name = 'testAddEditRemove';
    const newName = 'testRename';
    AppPage.getElementsCount('tr.complex').then(initCount => {
      ComplexPage.addComplex(name);
      expect(ComplexPage.getLatestAddedComplexName()).toEqual(name);
      AppPage.getElementsCount('tr.complex').then(count => {
        expect(count).toEqual(initCount + 1);
        ComplexPage.editLastComplex(newName, true);
        expect(ComplexPage.getLatestAddedComplexName()).toEqual(newName);
        ComplexPage.openLatestAddedComplex();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings/g);
          ComplexPage.navigateToHome();
          ComplexPage.editLastComplex(name, false);
          expect(ComplexPage.getLatestAddedComplexName()).toEqual(newName);
          AppPage.cancelEditingWithESC();
          ComplexPage.removeLastComplex();
          AppPage.getElementsCount('tr.complex').then(finalCount => {
            expect(finalCount).toEqual(initCount);
            done();
          });
        });
      });
    });
  });
});
