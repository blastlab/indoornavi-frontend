import {async, inject, TestBed} from '@angular/core/testing';

import {PublishedDialogComponent} from './published.dialog';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {DialogTestModule} from '../../utils/dialog/dialog.test';
import {HttpModule} from '@angular/http';
import {MaterialModule, MdDialog, MdDialogModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {HttpService} from '../../utils/http/http.service';
import {AuthGuard} from '../../auth/auth.guard';
import {UserService} from '../../user/user.service';
import {ComplexService} from '../../complex/complex.service';
import {BuildingService} from '../../building/building.service';
import {FloorService} from '../../floor/floor.service';
import {PublishedService} from 'app/published/published.service';
import {ToastService} from '../../utils/toast/toast.service';
import {SharedModule} from '../../utils/shared/shared.module';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {Observable} from 'rxjs/Rx';
import {Measure} from '../../map/toolbar/tools/scale/scale.type';
import {ConfigurationService} from '../../floor/configuration/configuration.service';
import {DeviceService} from '../../device/device.service';

describe('PublishedDialogComponent', () => {
  let component: PublishedDialogComponent;
  let dialog: MdDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpModule,
        DialogTestModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        AngularMultiSelectModule,
        MdDialogModule,
        SharedModule
      ],
      providers: [DeviceService, HttpService, AuthGuard, TranslateService,
        UserService, ComplexService, BuildingService, FloorService,
        ToastService, PublishedService, ConfigurationService]
    })
      .compileComponents();

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [PublishedDialogComponent]
      }
    });
  }));

  beforeEach(() => {
    dialog = TestBed.get(MdDialog);
    const dialogRef = dialog.open(PublishedDialogComponent);
    component = dialogRef.componentInstance;
  });

  it('should create component', inject([DeviceService, UserService, ComplexService], (deviceService: DeviceService, userService: UserService, complexService: ComplexService) => {
    spyOn(deviceService, 'getAll').and.returnValue(Observable.of([{}]));
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{}]));
    spyOn(complexService, 'getComplexes').and.returnValue(Observable.of([{}]));

    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(deviceService.getAll).toHaveBeenCalled();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(complexService.getComplexes).toHaveBeenCalled();
  }));

  it('should set buildings when complex changed', inject([BuildingService], (buildingService: BuildingService) => {
    // given
    spyOn(buildingService, 'getComplexWithBuildings').and.returnValue(Observable.of({
      buildings: [{id: 1}]
    }));

    // when
    component.complexChanged(1);

    // then
    expect(buildingService.getComplexWithBuildings).toHaveBeenCalledWith(1);
    expect(component.selectedComplexId).toBe(1);
    expect(component.selectedBuildingId).toBe(null);
    expect(component.selectedFloorId).toBe(null);
  }));

  it('should set floors when building changed', inject([FloorService], (floorService: FloorService) => {
    // given
    spyOn(floorService, 'getBuildingWithFloors').and.returnValue(Observable.of({
      floors: [{id: 1}]
    }));

    // when
    component.buildingChanged(1);

    // then
    expect(floorService.getBuildingWithFloors).toHaveBeenCalledWith(1);
    expect(component.selectedBuildingId).toBe(1);
    expect(component.selectedFloorId).toBe(null);
  }));

  it('should do nothing when save is called on invalid form', inject([PublishedService], (publishedMapService: PublishedService) => {
    // given
    spyOn(publishedMapService, 'save');

    // when
    component.save(false);

    // then
    expect(publishedMapService.save).not.toHaveBeenCalled();
  }));

  it('should call published map service to save map when form is valid',
    inject([PublishedService, ToastService, ConfigurationService],
      (publishedMapService: PublishedService, toastService: ToastService, configurationService: ConfigurationService) => {
        // given
        spyOn(publishedMapService, 'save').and.returnValue(Observable.of({id: 1}));
        spyOn(configurationService, 'loadConfiguration').and.callFake(() => {
        });
        spyOn(configurationService, 'configurationLoaded').and.returnValue(Observable.of({data: {scale: {}}}));
        spyOn(toastService, 'showSuccess');
        component.floors = [{
          id: 1,
          scale: {start: {x: 1, y: 1}, stop: {x: 1, y: 1}, realDistance: 1, measure: Measure.CENTIMETERS},
          level: 0,
          name: 'test',
          building: {name: 'test', complexId: 1},
          imageId: 1
        }];
        component.selectedFloorId = 1;

        // when
        component.save(true);

        // then
        expect(publishedMapService.save).toHaveBeenCalled();
        expect(toastService.showSuccess).toHaveBeenCalled();
        expect(configurationService.loadConfiguration).toHaveBeenCalled();
        expect(configurationService.configurationLoaded).toHaveBeenCalled();
      }));

  it('should display error toast when floor has no scale set',
    inject([PublishedService, ToastService, ConfigurationService],
      (publishedMapService: PublishedService, toastService: ToastService, configurationService: ConfigurationService) => {
        // given
        spyOn(toastService, 'showFailure');
        spyOn(configurationService, 'loadConfiguration').and.callFake(() => {
        });
        spyOn(configurationService, 'configurationLoaded').and.returnValue(Observable.of({data: {scale: null}}));
        component.floors = [{
          id: 1,
          scale: null,
          level: 0,
          name: 'test',
          building: {name: 'test', complexId: 1}
        }];
        component.selectedFloorId = 1;

        // when
        component.save(true);

        // then
        expect(toastService.showFailure).toHaveBeenCalledWith('publishedDialog.floor.scaleNotSet');
        expect(configurationService.loadConfiguration).toHaveBeenCalled();
        expect(configurationService.configurationLoaded).toHaveBeenCalled();
      }));

  it('should display error toast when floor has no image uploaded',
    inject([PublishedService, ToastService, ConfigurationService],
      (publishedMapService: PublishedService, toastService: ToastService, configurationService: ConfigurationService) => {
        // given
        spyOn(toastService, 'showFailure');
        spyOn(configurationService, 'loadConfiguration').and.callFake(() => {
        });
        spyOn(configurationService, 'configurationLoaded').and.returnValue(Observable.of({data: {scale: {}}}));
        component.floors = [{
          id: 1,
          scale: {start: {x: 1, y: 1}, stop: {x: 1, y: 1}, realDistance: 1, measure: Measure.CENTIMETERS},
          level: 0,
          name: 'test',
          building: {name: 'test', complexId: 1},
          imageId: null
        }];
        component.selectedFloorId = 1;

        // when
        component.save(true);

        // then
        expect(toastService.showFailure).toHaveBeenCalledWith('publishedDialog.floor.imageNotSet');
        expect(configurationService.loadConfiguration).toHaveBeenCalled();
        expect(configurationService.configurationLoaded).toHaveBeenCalled();
      }));

  it('should do nothing when setMap is called without map', () => {
    // given
    component.selectedComplexId = 1;
    spyOn(component, 'buildingChanged');
    spyOn(component, 'complexChanged');

    // when
    component.setMap(null);

    // then
    expect(component.selectedComplexId).toBe(1);
    expect(component.buildingChanged).not.toHaveBeenCalled();
    expect(component.complexChanged).not.toHaveBeenCalled();
  });

  it('should set all fields when setMap is called with map',
    inject([BuildingService, FloorService], (buildingService: BuildingService, floorService: FloorService) => {
      // given
      spyOn(component, 'buildingChanged');
      spyOn(component, 'complexChanged');
      spyOn(buildingService, 'getComplexWithBuildings').and.returnValue(Observable.of({
        buildings: [{id: 1}]
      }));
      spyOn(floorService, 'getBuildingWithFloors').and.returnValue(Observable.of({
        floors: [{id: 1}]
      }));
      const expectedMap = {
        floor: {
          id: 78,
          building: {
            id: 1,
            complexId: 99,
            name: ''
          },
          level: 0,
          name: ''
        },
        tags: [{
          id: 11,
          shortId: 111,
          longId: 111111,
          verified: true
        }],
        users: [{
          id: 1,
          username: 'test',
          permissionGroups: []
        }]
      };

      // when
      component.setMap(expectedMap);

      // then
      expect(component.selectedComplexId).toBe(99);
      expect(component.selectedBuildingId).toBe(1);
      expect(component.selectedFloorId).toBe(78);
      expect(component.selectedTags.length).toBe(1);
      expect(component.selectedUsers.length).toBe(1);
      expect(component.selectedMap).toBe(expectedMap);
      expect(component.buildingChanged).toHaveBeenCalled();
      expect(component.complexChanged).toHaveBeenCalled();
    }));
});
