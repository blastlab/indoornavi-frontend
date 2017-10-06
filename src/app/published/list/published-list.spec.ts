import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PublishedListComponent} from './published-list';
import {SharedModule} from '../../utils/shared/shared.module';
import {ToastService} from '../../utils/toast/toast.service';
import {PublishedService} from '../publication/published.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '@angular/material';
import {DialogTestModule} from '../../utils/dialog/dialog.test';
import {HttpService} from '../../utils/http/http.service';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {Observable} from 'rxjs/Rx';
import {PublishedMap} from '../publication/published.type';
import {UserService} from '../../user/user.service';
import {BuildingService} from '../../building/building.service';
import {ComplexService} from '../../complex/complex.service';
import {FloorService} from '../../floor/floor.service';
import {DeviceService} from '../../device/device.service';
import {ActionBarService} from '../../map/actionbar/actionbar.service';

describe('PublishedListComponent', () => {
  let component: PublishedListComponent;
  let fixture: ComponentFixture<PublishedListComponent>;
  let publishedService: PublishedService;
  let complexService: ComplexService;
  let userService: UserService;
  let deviceService: DeviceService;
  let buildingService: BuildingService;
  let floorService: FloorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublishedListComponent],
      imports: [
        BrowserModule,
        MaterialModule,
        DialogTestModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        SharedModule, NgxDatatableModule],
      providers: [
        PublishedService, TranslateService, ToastService,
        HttpService, AuthGuard, DeviceService, UserService,
        ComplexService, BuildingService, FloorService,
        ActionBarService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishedListComponent);
    component = fixture.componentInstance;
    publishedService = fixture.debugElement.injector.get(PublishedService);
    complexService = fixture.debugElement.injector.get(ComplexService);
    userService = fixture.debugElement.injector.get(UserService);
    deviceService = fixture.debugElement.injector.get(DeviceService);
    buildingService = fixture.debugElement.injector.get(BuildingService);
    floorService = fixture.debugElement.injector.get(FloorService);
  });

  it('get all maps', () => {
    // given
    spyOn(publishedService, 'getAll').and.returnValue(Observable.of([<PublishedMap>{
      id: 1,
      floor: {id: 1},
      users: [],
      tags: []
    }]));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(publishedService.getAll).toHaveBeenCalled();
    expect(component.rows.length).toBe(1);
  });

  it('should open dialog to create new map', () => {
    // given
    const expected = <PublishedMap> {id: 1, floor: {id: 1}, users: [], tags: []};
    component.rows = [];

    // when
    component.openDialog(null);
    component.dialogRef.close(expected);

    // then
    expect(component.rows.length).toBe(1);
  });

  it('should NOT create new map when it is already on the list', () => {
    // given
    const expected = <PublishedMap> {id: 1, floor: {id: 1, building: {id: 1, complexId: 1}}, users: [], tags: []};
    component.rows = [expected];

    // when
    component.openDialog(null);
    component.dialogRef.close(expected);

    // then
    expect(component.rows.length).toBe(1);
  });

  it('should open dialog to edit map', () => {
    // given
    const expected = <PublishedMap> {id: 1, floor: {id: 1, building: {id: 1, complexId: 1}}, users: [], tags: []};
    spyOn(component, 'openDialog').and.callThrough();
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{}]));
    spyOn(complexService, 'getComplexes').and.returnValue(Observable.of([{}]));
    spyOn(deviceService, 'getAll').and.returnValue(Observable.of([{}]));
    spyOn(buildingService, 'getComplexWithBuildings').and.returnValue(Observable.of([{}]));
    spyOn(floorService, 'getBuildingWithFloors').and.returnValue(Observable.of([{}]));
    component.rows = [expected];

    // when
    component.edit(expected);
    component.dialogRef.close(expected);

    // then
    expect(component.rows.length).toBe(1);
    expect(component.openDialog).toHaveBeenCalledWith(expected);
  });

  it('should remove map', () => {
    // given
    const expected = <PublishedMap> {id: 1, floor: {id: 1, building: {id: 1, complexId: 1}}, users: [], tags: []};
    spyOn(publishedService, 'remove').and.returnValue(Observable.of({}));
    component.rows = [expected];

    // when
    component.remove(expected);

    // then
    expect(component.rows.length).toBe(0);
    expect(publishedService.remove).toHaveBeenCalledWith(1);
  });
});
