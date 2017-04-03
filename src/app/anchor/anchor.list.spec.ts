import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MaterialModule, MdDialog} from '@angular/material';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {AnchorListComponent} from './anchor.list';
import {AnchorService} from './anchor.service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Anchor} from './anchor.type';
import {DndModule} from 'ng2-dnd';
import {TranslateModule} from '@ngx-translate/core';
import {Observable} from 'rxjs/Rx';
import {AnchorComponent} from './anchor';

describe('AnchorListComponent', () => {
  let component: AnchorListComponent;
  let fixture: ComponentFixture<AnchorListComponent>;

  let dialog: MdDialog;
  let anchorService: AnchorService;
  let toastService: ToastService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        DndModule.forRoot(),
        MaterialModule,
        DialogTestModule
      ],
      declarations: [AnchorComponent, AnchorListComponent],
      providers: [AnchorService, HttpService, ToastService, MdDialog]
    }).compileComponents();

    fixture = TestBed.createComponent(AnchorListComponent);
    component = fixture.debugElement.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    anchorService = fixture.debugElement.injector.get(AnchorService);
    toastService = fixture.debugElement.injector.get(ToastService);

    spyOn(toastService, 'showSuccess');
  }));

  it('should update anchor verified state when added to verified list', () => {
    // given
    const expectedAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: true};
    const currentAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(anchorService, 'updateAnchor').and.returnValue(Observable.of(expectedAnchor));

    // when
    component.addToList({dragData: currentAnchor});

    // then
    expect(anchorService.updateAnchor).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.anchors.getValue(1)).toBe(expectedAnchor);
  });

  it('should open dialog to edit anchor', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();
    const currentAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};

    // when
    component.openDialog(currentAnchor);

    // then
    expect(component.dialogRef.componentInstance.anchor).toBeDefined();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should edit anchor when dialog closes with value', () => {
    // given
    const expectedAnchor: Anchor = {id: 1, shortId: 2, longId: 15, verified: false, name: 'test'};
    const currentAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(dialog, 'open').and.callThrough();
    spyOn(anchorService, 'updateAnchor').and.returnValue(Observable.of(expectedAnchor));

    // when
    component.openDialog(currentAnchor);
    component.dialogRef.close(expectedAnchor);

    // then
    expect(anchorService.updateAnchor).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.getAnchors().length).toBe(1);
    expect(component.anchors.getValue(1)).toBe(expectedAnchor);
  });

  it('should remove anchor from list and call service to remove it from db', () => {
    // given
    spyOn(anchorService, 'removeAnchor').and.returnValue(Observable.of({}));
    const currentAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};
    component.anchors.setValue(1, currentAnchor);

    // when
    component.remove(currentAnchor);

    // then
    expect(anchorService.removeAnchor).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.getAnchors().length).toBe(0);
  });
});
