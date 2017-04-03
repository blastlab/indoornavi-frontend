import {ComplexPage} from './complex.po';
import {AppPage} from '../app.po';

describe('ComplexComponent', () => {
  it('should have title', () => {
    ComplexPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Your building complexes');
  });

  it('should be able to add new complex', () => {
    const newName = 'test';
    ComplexPage.navigateToHome();
    ComplexPage.addComplex(newName);
    expect(ComplexPage.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to remove complex', () => {
    const newName = 'test';
    ComplexPage.navigateToHome();
    ComplexPage.addComplex(newName);
    ComplexPage.removeLastComplex();
    expect(ComplexPage.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to edit complex', () => {
    const newName = 'test';
    const newName2 = 'test2';
    ComplexPage.navigateToHome();
    ComplexPage.addComplex(newName);
    ComplexPage.editLastComplex(newName2, true);
    expect(ComplexPage.getLatestAddedComplex()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    ComplexPage.navigateToHome();
    ComplexPage.addComplex(newName);
    ComplexPage.editLastComplex(newName2, false);
    ComplexPage.cancelEditingLastComplex();
    expect(ComplexPage.getLatestAddedComplex()).toEqual(newName);
  });

});
