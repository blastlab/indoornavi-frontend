import {IndoorNaviPage} from './app.complex.po';

describe('ComplexComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should have title', () => {
    page.navigateToHome();
    expect(page.getTitle()).toEqual('Your building complexes');
  });

  it('should be able to add new complex', () => {
    const newName = 'test';
    page.navigateToHome();
    page.addComplex(newName);
    expect(page.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to remove complex', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex(newName);
    page.addComplex(newName2);
    page.removeLastComplex();
    expect(page.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to edit complex', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex(newName);
    page.editLastComplex(newName2);
    expect(page.getLatestAddedComplex()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex(newName);
    page.editLastComplexWithoutSaving(newName2);
    page.cancelEditingLastComplex();
    expect(page.getLatestAddedComplex()).toEqual(newName);
  });

});
