import {TestBed, async} from '@angular/core/testing';
import {BuildingComponent} from './building';
import {FormsModule} from '@angular/forms';
import {BuildingService} from './building.service';
import {Observable} from 'rxjs/Rx';
import {MaterialModule} from '@angular/material';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {MdDialog} from '@angular/material';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {TranslateModule} from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {ActivatedRoute} from '@angular/router';

describe('BuildingComponent', () => {

  let component: BuildingComponent;
  let buildingService: BuildingService;
  let toastService: ToastService;
  let dialog: MdDialog;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, MaterialModule, HttpModule, DialogTestModule, TranslateModule.forRoot(), RouterTestingModule],
      declarations: [
        BuildingComponent
      ],
      providers: [
        BuildingService, HttpService, ToastService, MdDialog
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(BuildingComponent);
    component = fixture.debugElement.componentInstance;
    buildingService = fixture.debugElement.injector.get(BuildingService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    route = fixture.debugElement.injector.get(ActivatedRoute);

    spyOn(toastService, 'showSuccess');
  }));

  it('should create building', async(() => {
    // given
    spyOn(buildingService, 'getBuildings').and.returnValue(Observable.of({buildings: [{'name': 'test', complexId: 1}]}));
    spyOn(route, 'params').and.returnValue(Observable.of({id: 1}));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(buildingService.getBuildings).toHaveBeenCalled();

    expect(component.buildings.length).toEqual(1);
    expect(component.buildings).toContain({'name': 'test', complexId: 1});
    // expect(component.building).toContain({'name': ''});
  }));

  it('should add new building to list when form is valid', () => {
    // given
    const newBuildingName = 'some name';
    spyOn(buildingService, 'addBuilding').and.returnValue(Observable.of({'name': newBuildingName}));
    const isValid = true;

    // when
    component.addBuilding({name: newBuildingName, complexId: 1}, isValid);

    // then
    expect(buildingService.addBuilding).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();

    expect(component.buildings.length).toEqual(1);
    expect(component.buildings).toContain({'name': newBuildingName});
  });

  it('should NOT add new building to list when form is invalid', () => {
    // given
    const isValid = false;

    // when
    component.addBuilding({name: 'someName', complexId: 1}, isValid);

    // then
    expect(component.buildings.length).toEqual(0);
  });

  it('should remove building from list', () => {
    // given
    const newBuildingName = 'some name';
    const newBuildingName2 = 'some different name';
    component.buildings = [{name: newBuildingName, complexId: 1}, {name: newBuildingName2, complexId: 1}];
    spyOn(buildingService, 'removeBuilding').and.returnValue(Observable.of({}));

    // when
    component.removeBuilding(0);

    // then
    expect(buildingService.removeBuilding).toHaveBeenCalled();
    expect(component.buildings.length).toEqual(1);
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should open dialog to edit building name', () => {
    // given
    const oldBuildingName = 'some name';
    component.buildings = [{name: oldBuildingName, complexId: 1}];
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.editBuilding(component.buildings[0]);

    // then
    expect(component.dialogRef.componentInstance.name).toEqual(oldBuildingName);
    expect(component.buildings.length).toEqual(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should set new building name when dialog closes', () => {
    // given
    const oldBuildingName = 'some name';
    const newBuildingName = 'some new name';
    component.buildings = [{name: oldBuildingName, complexId: 1}];
    spyOn(dialog, 'open').and.callThrough();
    spyOn(buildingService, 'updateBuilding').and.returnValue(Observable.of({name: newBuildingName}));

    // when
    component.editBuilding(component.buildings[0]);
    component.dialogRef.close(newBuildingName);

    // then
    expect(component.buildings.length).toEqual(1);
    expect(component.buildings[0].name).toEqual(newBuildingName);
    expect(buildingService.updateBuilding).toHaveBeenCalled();
  });

  it('should NOT set new building name when dialog closes without value', () => {
    // given
    const oldBuildingName = 'some name';
    component.buildings = [{name: oldBuildingName, complexId: 1}];
    spyOn(dialog, 'open').and.callThrough();
    spyOn(buildingService, 'updateBuilding');

    // when
    component.editBuilding(component.buildings[0]);
    component.dialogRef.close();

    // then
    expect(component.buildings[0].name).toEqual(oldBuildingName);
    expect(buildingService.updateBuilding).toHaveBeenCalledTimes(0);
  });

});
