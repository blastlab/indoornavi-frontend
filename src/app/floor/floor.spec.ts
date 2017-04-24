import {async, TestBed} from '@angular/core/testing';
import {FloorComponent} from './floor';
import {FormsModule} from '@angular/forms';
import {FloorService} from './floor.service';
import {Observable} from 'rxjs/Rx';
import {MaterialModule, MdDialog} from '@angular/material';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {TranslateModule} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {ActivatedRoute} from '@angular/router';

describe('FloorComponent', () => {

  let component: FloorComponent;
  let floorService: FloorService;
  let toastService: ToastService;
  let dialog: MdDialog;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, MaterialModule, HttpModule, DialogTestModule, TranslateModule.forRoot(), RouterTestingModule],
      declarations: [
        FloorComponent
      ],
      providers: [
        FloorService, HttpService, ToastService, MdDialog
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(FloorComponent);
    component = fixture.debugElement.componentInstance;
    floorService = fixture.debugElement.injector.get(FloorService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    route = fixture.debugElement.injector.get(ActivatedRoute);

    spyOn(toastService, 'showSuccess');
  }));

  it('should create floor', async(() => {
    // given
    spyOn(floorService, 'getFloors').and.returnValue(Observable.of({floors: [{'level': 0, 'name': 'test', buildingId: 1}]}));
    spyOn(route, 'params').and.returnValue(Observable.of({id: 1}));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(floorService.getFloors).toHaveBeenCalled();

    expect(component.floors.length).toEqual(1);
    expect(component.floors).toContain({'level': 0, 'name': 'test', buildingId: 1});
    // expect(component.building).toContain({'name': ''});
  }));

  it('should add new floor to list when form is valid', () => {
    // given
    const newFloorName = 'some name';
    spyOn(floorService, 'addFloor').and.returnValue(Observable.of({'name': newFloorName}));
    const isValid = true;

    // when
    component.addFloor({'level': 0, name: newFloorName, buildingId: 1}, isValid);

    // then
    expect(floorService.addFloor).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();

    expect(component.floors.length).toEqual(1);
    expect(component.floors).toContain({'name': newFloorName});
  });

  it('should NOT add new floor to list when form is invalid', () => {
    // given
    const isValid = false;

    // when
    component.addFloor({'level': 0, name: 'someName', buildingId: 1}, isValid);

    // then
    expect(component.floors.length).toEqual(0);
  });

  it('should remove floor from list', () => {
    // given
    const newFloorName = 'some name';
    const newFloorName2 = 'some different name';
    component.floors = [{'level': 0, name: newFloorName, buildingId: 1}, {'level': 0, name: newFloorName2, buildingId: 1}];
    spyOn(floorService, 'removeFloor').and.returnValue(Observable.of({}));

    // when
    component.removeFloor(0);

    // then
    expect(floorService.removeFloor).toHaveBeenCalled();
    expect(component.floors.length).toEqual(1);
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should open dialog to edit floor name', () => {
    // given
    const oldFloorName = 'some name';
    component.floors = [{'level': 0, name: oldFloorName, buildingId: 1}];
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.editFloor(component.floors[0]);

    // then
    expect(component.dialogRef.componentInstance.name).toEqual(oldFloorName);
    expect(component.floors.length).toEqual(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should set new floor name when dialog closes', () => {
    // given
    const oldFloorName = 'some name';
    const newFloorName = 'some new name';
    component.floors = [{'level': 0, name: oldFloorName, buildingId: 1}];
    spyOn(dialog, 'open').and.callThrough();
    spyOn(floorService, 'updateFloor').and.returnValue(Observable.of({name: newFloorName}));

    // when
    component.editFloor(component.floors[0]);
    component.dialogRef.close(newFloorName);

    // then
    expect(component.floors.length).toEqual(1);
    expect(component.floors[0].name).toEqual(newFloorName);
    expect(floorService.updateFloor).toHaveBeenCalled();
  });

  it('should NOT set new floor name when dialog closes without value', () => {
    // given
    const oldFloorName = 'some name';
    component.floors = [{'level': 0, name: oldFloorName, buildingId: 1}];
    spyOn(dialog, 'open').and.callThrough();
    spyOn(floorService, 'updateFloor');

    // when
    component.editFloor(component.floors[0]);
    component.dialogRef.close();

    // then
    expect(component.floors[0].name).toEqual(oldFloorName);
    expect(floorService.updateFloor).toHaveBeenCalledTimes(0);
  });

});
