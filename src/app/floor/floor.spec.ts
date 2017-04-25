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
import {DndModule} from 'ng2-dnd';
import {Floor} from './floor.type';

describe('FloorComponent', () => {

  let component: FloorComponent;
  let floorService: FloorService;
  let toastService: ToastService;
  let dialog: MdDialog;
  let route: ActivatedRoute;
  let sortableData: DndModule;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, MaterialModule, HttpModule, DialogTestModule, TranslateModule.forRoot(), RouterTestingModule, DndModule.forRoot()],
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
    sortableData = fixture.debugElement.injector.get(DndModule);

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
    expect(component.dialogRef.componentInstance.floor.name).toEqual(oldFloorName);
    expect(component.floors.length).toEqual(1);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should set new floor name when dialog closes', () => {
    // given
    const oldFloorName = 'some name';
    const newFloorName = 'some new name';
    component.floors = [{'level': 0, name: oldFloorName, buildingId: 1}];
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.editFloor(component.floors[0]);
    component.dialogRef.close({name: newFloorName, buildingId: 1});

    // then
    expect(component.floors.length).toEqual(1);
    expect(component.floors[0].name).toEqual(newFloorName);
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

  it('should open dialog to create new floor', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();

    // then
    expect(component.dialogRef.componentInstance.floor).toBeDefined();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create new floor when dialog closes with value', () => {
    // given
    const expectedFloor: Floor = {id: 1, level: 1, name: 'test', buildingId: 1};
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();
    component.dialogRef.close(expectedFloor);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  describe('when we want to update floor numbers', () => {
    describe('and we moved floor 5 between floors 2 and 4', () => {
      it('should change floor number 5 to 3', () => {
        // given
        component.floors = [
          {name: 'xxx', level: 2, buildingId: 1},
          {name: 'xxx', level: 5, buildingId: 1},
          {name: 'xxx', level: 4, buildingId: 1}
        ];

        // when
        component.rearrangeFloors();

        // then
        expect(component.floors.length).toEqual(3);
        expect(component.floors[0].level).toEqual(2);
        expect(component.floors[1].level).toEqual(3);
        expect(component.floors[2].level).toEqual(4);
      });
    });
    describe('and we moved floor 2 between floors 4 and 7', () => {
      it('should change floor number 4 to 1', () => {
        // given
        component.floors = [
          {name: 'xxx', level: 4, buildingId: 1},
          {name: 'xxx', level: 2, buildingId: 1},
          {name: 'xxx', level: 7, buildingId: 1}
        ];

        // when
        component.rearrangeFloors();

        // then
        expect(component.floors.length).toEqual(3);
        expect(component.floors[0].level).toEqual(1);
        expect(component.floors[1].level).toEqual(2);
        expect(component.floors[2].level).toEqual(7);
      });
    });
    describe('and we moved floor 6 before floor 0 and 3', () => {
      it('should change floor number 6 to -1', () => {
        // given
        component.floors = [
          {name: 'xxx', level: 6, buildingId: 1},
          {name: 'xxx', level: 0, buildingId: 1},
          {name: 'xxx', level: 3, buildingId: 1}
        ];

        // when
        component.rearrangeFloors();

        // then
        expect(component.floors.length).toEqual(3);
        expect(component.floors[0].level).toEqual(-1);
        expect(component.floors[1].level).toEqual(0);
        expect(component.floors[2].level).toEqual(3);
      });
    });
    describe('and we moved floor 2 after floor 7', () => {
      it('should change floor number 7 to 6 and 2 to 7', () => {
        // given
        component.floors = [
          {name: 'xxx', level: 5, buildingId: 1},
          {name: 'xxx', level: 7, buildingId: 1},
          {name: 'xxx', level: 2, buildingId: 1}
        ];

        // when
        component.rearrangeFloors();

        // then
        expect(component.floors.length).toEqual(3);
        expect(component.floors[0].level).toEqual(5);
        expect(component.floors[1].level).toEqual(6);
        expect(component.floors[2].level).toEqual(7);
      });
    });

  });

});
