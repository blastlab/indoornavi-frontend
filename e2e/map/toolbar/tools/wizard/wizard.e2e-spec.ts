import {WizardTool} from './wizard.po';
import {AppPage} from '../../../../app.po';
import {ActionBarChecker} from '../../../actionbar/actionbar.checker';

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
    WizardTool.waitForElement('#map');
    expect(AppPage.getById('map').getTagName()).toEqual('svg');
  });

  it('should start wizard', () => {
    WizardTool.clickWizardTool();
    expect(AppPage.getByClass('cdk-focus-trap-content').getTagName()).toEqual('div');
    WizardTool.waitForElement('.dialog-select');
    expect(AppPage.getByClass('dialog-place-button').isDisplayed()).toBeTruthy();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeTruthy();
    expect(AppPage.getById('publish').getAttribute('disabled')).toEqual('true');
  });

  it('should select a sink', () => {
    WizardTool.waitForElement('.dialog-select');
    WizardTool.openSelectChoices();
    WizardTool.chooseFirstSelectOption();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeFalsy();
  });

  it('should place sink on map', (done: DoneFn) => {
    AppPage.getByClass('dialog-place-button').click();
    const testedSink = AppPage.getByClass('wizardSink');
    const testCoords = {x: 199, y: 273};
    expect(testedSink.isPresent()).toBeFalsy();
    WizardTool.clickOnMap(testCoords);
    expect(testedSink.isPresent()).toBeTruthy();
    testedSink.getAttribute('x').then((attrString) => {
      expect(parseInt(attrString, 10)).toEqual(149);
      testedSink.getAttribute('y').then((attr) => {
        expect(parseInt(attr, 10)).toEqual(223);
        done();
      });
    });
  });

  it('should drag sink (to correct its position)', (done: DoneFn) => {
    const testSink = AppPage.getByClass('wizardSink');
    const translation = {x: 1, y: -23};
    WizardTool.dragElementBy(testSink, translation);
    testSink.getAttribute('x').then((attrString) => {
      expect(parseInt(attrString, 10)).toEqual(150);
      testSink.getAttribute('y').then((attr) => {
        expect(parseInt(attr, 10)).toEqual(200);
        done();
      });
    });
  });

  it('should try to decline position', () => {
    WizardTool.clickDecisionButton(false);
    expect(AppPage.getByClass('cdk-focus-trap-content').getTagName()).toEqual('div');
    WizardTool.waitForElement('.dialog-select');
    expect(AppPage.getByClass('dialog-place-button').isDisplayed()).toBeTruthy();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeTruthy();
  });

  it('should place sink again and accept new position', () => {
    const sink = AppPage.getByClass('wizardSink');
    const testCoords = {x: 250, y: 520};
    WizardTool.openSelectChoices();
    WizardTool.chooseFirstSelectOption();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeFalsy();
    AppPage.getByClass('dialog-place-button').click();
    expect(sink.isPresent()).toBeFalsy();
    WizardTool.clickOnMap(testCoords);
    expect(sink.isPresent()).toBeTruthy();
    WizardTool.clickDecisionButton(true);
  });

  it('should have secondStep dialog opened now', () => {
    expect(AppPage.getByClass('cdk-focus-trap-content').getTagName()).toEqual('div');
    WizardTool.waitForElement('.dialog-select');
    expect(AppPage.getByClass('dialog-place-button').isDisplayed()).toBeTruthy();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeTruthy();
  });

  it('should have visible distance, then place anchor and drag, finally accept', (done: DoneFn) => {
    const anchor = AppPage.getByClass('wizardAnchor');
    const testCoords = {x: 564, y: 27};
    const translation = {x: -114, y: 213};
    WizardTool.openSelectChoices();
    WizardTool.chooseFirstSelectOption();
    expect(AppPage.getByClass('dialog-place-button').getAttribute('disabled')).toBeFalsy();
    AppPage.getByClass('dialog-place-button').click();
    expect(AppPage.getById('sinkDistance').getTagName()).toEqual('circle');
    expect(anchor.isPresent()).toBeFalsy();
    WizardTool.clickOnMap(testCoords);
    expect(anchor.isPresent()).toBeTruthy();
    WizardTool.dragElementBy(anchor, translation);
    anchor.getAttribute('x').then((attrString) => {
      expect(parseInt(attrString, 10)).toEqual(400);
      anchor.getAttribute('y').then((attr) => {
        expect(parseInt(attr, 10)).toEqual(190);
        WizardTool.clickDecisionButton(true);
        done();
      });
    });
  });

  it('should show warning (with close on overlayClick disabled) when all steps has not been completed ', () => {
    WizardTool.waitForElement('.dialog-select');
    AppPage.cancelEditingWithESC();
    expect(AppPage.getByClass('wizard-not-complete').getTagName()).toEqual('h3');
    AppPage.cancelEditingWithESC(); // this shouldn't close warning window
    expect(AppPage.getByClass('wizard-not-complete').getTagName()).toEqual('h3');
    AppPage.getByClass('warning-back-button').click();
    expect(AppPage.getByClass('cdk-focus-trap-content').getTagName()).toEqual('div');
  });

  it('should go through third step easily', (done: DoneFn) => {
    const testCoords = {x: 123, y: 456};
    WizardTool.waitForElement('.dialog-select');
    WizardTool.openSelectChoices();
    WizardTool.chooseFirstSelectOption();
    AppPage.getByClass('dialog-place-button').click();
    AppPage.getElementsCount('.suggested-position').then(count => {
      expect(count).toEqual(2);
      WizardTool.clickOnMap(testCoords);
      WizardTool.clickDecisionButton(true);
      AppPage.getElementsCount('.suggested-position').then(zero => {
        expect(zero).toEqual(0);
        expect(AppPage.getByClass('wizard-complete').getTagName()).toEqual('h3');
        AppPage.getByClass('dialog-exit-button').click();
        ActionBarChecker.expectButtonsToBeInProperStateBeforeAndAfter([{
            id: 'saveDraft',
            disabled: null
          }], () => {},
          null,
          [
            {
              id: 'publish',
              disabled: null
            },
            {
              id: 'resetToPrevious',
              disabled: null
            }
          ]);
        done();
      });
    });
  });

});
