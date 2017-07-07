import {WizardTool} from './wizard.po';
import {AppPage} from '../../../../app.po';

/**
 * webSocket connection in app MUST be closed before running this test
 */
describe('WizardTool', () => {

  beforeAll(() => {
    WizardTool.prepareMap('testWizardTool');
  });

  afterAll(() => {
    WizardTool.destroyLastComplex();
  });

  it('should have map uploaded', () => {
    expect(AppPage.getById('map').getTagName()).toEqual('svg');
  });

  it('should start wizard', () => {
    WizardTool.clickWizardTool();
    expect(WizardTool.getDialogContent().getTagName()).toEqual('div');
    // expect first dialog, and `go to map` button disabled
  });

  it('should select a sink', () => {
    // expect selected sink and button enabled
  });


});
