import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MapEditorComponent} from './map.editor';
import {ScaleInputComponent} from './tool-bar/tools/scale/input/input';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from './tool-bar/tools/scale/hint/hint.service';
import {ScaleInputService} from './tool-bar/tools/scale/input/input.service';
import {FormsModule} from '@angular/forms';
import {ScaleHintComponent} from './tool-bar/tools/scale/hint/hint';
import {TranslateModule} from '@ngx-translate/core';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {FloorService} from '../floor/floor.service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import {AuthGuard} from '../auth/auth.guard';
import {AcceptButtonsComponent} from '../utils/accept-buttons/accept-buttons';
import {AcceptButtonsService} from '../utils/accept-buttons/accept-buttons.service';
import {Observable} from 'rxjs/Observable';
import {ScaleService} from './tool-bar/tools/scale/scale.service';
import {MapViewerService} from './map.editor.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('MapEditorComponent', () => {
  let component: MapEditorComponent;
  let fixture: ComponentFixture<MapEditorComponent>;
  const floor: Floor = <Floor> {
    imageId: 23
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MaterialModule,
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      declarations: [
        MapEditorComponent,
        ScaleInputComponent,
        ScaleHintComponent,
        AcceptButtonsComponent],
      providers: [
        ScaleInputService,
        ScaleHintService,
        MapLoaderInformerService,
        FloorService,
        HttpService,
        ToastService,
        MapService,
        AuthGuard,
        AcceptButtonsService,
        ScaleService,
        MapViewerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapEditorComponent);
    component = fixture.componentInstance;
    component.floor = floor;
    const mapService = fixture.debugElement.injector.get(MapService);
    spyOn(mapService, 'getImage').and.returnValue(Observable.of(new Blob()));
    fixture.detectChanges();
  });

  it('should create MapEditorComponent', () => {
    expect(component).toBeTruthy();
  });
});

