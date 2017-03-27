import {TestBed, async} from '@angular/core/testing';
import {ComplexComponent} from './complex';
import {FormsModule} from '@angular/forms';
import {ComplexService} from './complex.service';
import {Observable} from 'rxjs/Rx';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {MdDialog} from '@angular/material';
import {DialogTestModule} from '../utils/dialog/dialog.test';

describe('ComplexComponent', () => {

  let component: ComplexComponent;
  let complexService: ComplexService;
  let toastService: ToastService;
  let dialog: MdDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, TranslateModule.forRoot(), MaterialModule, DialogTestModule],
      declarations: [
        ComplexComponent
      ],
      providers: [
        ComplexService, HttpService, ToastService, MdDialog
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ComplexComponent);
    component = fixture.debugElement.componentInstance;
    complexService = fixture.debugElement.injector.get(ComplexService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);

    spyOn(toastService, 'showSuccess');
  }));

  it('should create component', async(() => {
    // given
    spyOn(complexService, 'getComplexes').and.returnValue(Observable.of([{'name': 'test'}]));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(complexService.getComplexes).toHaveBeenCalled();

    expect(component.complexes.length).toEqual(1);
    expect(component.complexes).toContain({'name': 'test'});
    expect(component.complex).toEqual({'name': ''}, 'Complex model should be created');
  }));

  it('should add new complex to list when form is valid', () => {
    // given
    const newComplexName = 'some name';
    spyOn(complexService, 'addComplex').and.returnValue(Observable.of({'name': newComplexName}));
    const isValid = true;

    // when
    component.addComplex({name: newComplexName}, isValid);

    // then
    expect(complexService.addComplex).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();

    expect(component.complexes.length).toEqual(1);
    expect(component.complexes).toContain({'name': newComplexName});
  });

  it('should NOT add new complex to list when form is invalid', () => {
    // given
    const isValid = false;

    // when
    component.addComplex({name: 'someName'}, isValid);

    // then
    expect(component.complexes.length).toEqual(0);
  });

  it('should remove complex from list', () => {
    // given
    const newComplexName = 'some name';
    const newComplexName2 = 'some different name';
    component.complexes = [{name: newComplexName}, {name: newComplexName2}];
    spyOn(complexService, 'removeComplex').and.returnValue(Observable.of({}));

    // when
    component.removeComplex(0);

    // then
    expect(complexService.removeComplex).toHaveBeenCalled();
    expect(component.complexes.length).toEqual(1);
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should open dialog to edit complex name', () => {
    // given
    const oldComplexName = 'some name';
    component.complexes = [{name: oldComplexName}];
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.editComplex({name: oldComplexName});

    // then
    expect(component.dialogRef.componentInstance.name).toEqual(oldComplexName);
    expect(component.complexes.length).toEqual(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should set new complex name when dialog closes', () => {
    // given
    const oldComplexName = 'some name';
    const newComplexName = 'some new name';
    component.complexes = [{name: oldComplexName}];
    spyOn(dialog, 'open').and.callThrough();
    spyOn(complexService, 'updateComplex').and.returnValue(Observable.of({name: newComplexName}));

    // when
    component.editComplex({name: oldComplexName});
    component.dialogRef.close(newComplexName);

    // then
    expect(component.complexes.length).toEqual(1);
    expect(component.complex.name).toEqual(newComplexName);
    expect(complexService.updateComplex).toHaveBeenCalled();
  });

  it('should NOT set new complex name when dialog closes without value', () => {
    // given
    const oldComplexName = 'some name';
    component.complex = {name: oldComplexName};
    spyOn(dialog, 'open').and.callThrough();
    spyOn(complexService, 'updateComplex');

    // when
    component.editComplex({name: oldComplexName});
    component.dialogRef.close();

    // then
    expect(component.complex.name).toEqual(oldComplexName);
    expect(complexService.updateComplex).toHaveBeenCalledTimes(0);
  });

});
