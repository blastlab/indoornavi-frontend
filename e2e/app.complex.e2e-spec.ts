import { IndoorNaviPage } from './app.complex.po';

describe('AppComplex', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should have title', () => {
    page.navigateToHome();
    expect(page.getTitle()).toEqual('Your building complexes');
  });

  it('should be able to add new complex', () => {
    const newName:string = 'test';
    page.navigateToHome();
    page.addComplex(newName);
    expect(page.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to remove complex', () => {
    const newName:string = 'test';
    const newName2:string = 'test2';
    page.navigateToHome();
    page.addComplex(newName);
    page.addComplex(newName2);
    page.removeComplex(1);
    expect(page.getLatestAddedComplex()).toEqual(newName);
  });

  it('should be able to edit complex', () => {
    const newName:string = 'test';
    const newName2:string = 'test2';
    page.navigateToHome();
    page.addComplex(newName);
    page.editComplex(0, newName2);
    expect(page.getLatestAddedComplex()).toEqual(newName2);
  });

});
