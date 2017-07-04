import {ComplexPage} from './complex.po';
import {AppPage} from '../app.po';

describe('ComplexComponent', () => {

  beforeEach((done: DoneFn) => {
    ComplexPage.navigateToHome();
    done();
  });

  it('should have title', () => {
    expect(AppPage.getTitle()).toEqual('Your building complexes');
  });

  it('...be able to add new, edit, cancel editing, open (then go back) and remove complex', (done: DoneFn) => {
    const name = 'testAddEditRemove';
    const newName = 'testRename';
    ComplexPage.getComplexesCount().then(initCount => {
      ComplexPage.addComplex(name);
      expect(ComplexPage.getLatestAddedComplex()).toEqual(name);
      ComplexPage.getComplexesCount().then(count => {
        expect(count).toEqual(initCount + 1);
        ComplexPage.editLastComplex(newName, true);
        expect(ComplexPage.getLatestAddedComplex()).toEqual(newName);
        ComplexPage.openLatestAddedComplex();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings/g);
          ComplexPage.navigateToHome();
          done();
        });
        ComplexPage.editLastComplex(name, false);
        expect(ComplexPage.getLatestAddedComplex()).toEqual(newName);
        AppPage.cancelEditingWithESC();
        ComplexPage.removeLastComplex();
        ComplexPage.getComplexesCount().then(finalCount => {
          expect(finalCount).toEqual(initCount);
          done();
        });
      });
    });
  });
});
