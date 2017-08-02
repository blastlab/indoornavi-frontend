import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ToolbarComponent} from './toolbar';
import {ScaleComponent} from './tools/scale/scale';
import {WizardComponent} from './tools/wizard/wizard';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {FirstStepComponent} from './tools/wizard/first-step/first-step';
import {SecondStepComponent} from './tools/wizard/second-step/second-step';
import {ThirdStepComponent} from './tools/wizard/third-step/third-step';
import {FormsModule} from '@angular/forms';
import {SocketService} from '../../utils/socket/socket.service';
import {WebSocketService} from 'angular2-websocket-service';
import {ToastService} from '../../utils/toast/toast.service';
import {HintBarService} from '../hint-bar/hint-bar.service';
import {AcceptButtonsService} from '../../utils/accept-buttons/accept-buttons.service';
import {DrawingService} from '../../utils/drawing/drawing.service';
import {IconService} from '../../utils/drawing/icon.service';
import {ScaleInputService} from './tools/scale/input/input.service';
import {ScaleHintService} from './tools/scale/hint/hint.service';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {AnchorPlacerComponent} from './tools/anchor/anchor';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let mockScaleTool: ScaleComponent;
  let mockWizardTool: WizardComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [ToolbarComponent, ScaleComponent, WizardComponent, FirstStepComponent, SecondStepComponent,
        ThirdStepComponent, AnchorPlacerComponent],
      providers: [
        SocketService, WebSocketService, ToastService, HintBarService, AcceptButtonsService, DrawingService,
        IconService, ScaleComponent, WizardComponent, ScaleInputService, ScaleHintService, MapLoaderInformerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    mockScaleTool = fixture.debugElement.injector.get(ScaleComponent);
    mockWizardTool = fixture.debugElement.injector.get(WizardComponent);
    spyOn(mockScaleTool, 'setActive').and.callFake(() => {
    });
    spyOn(mockWizardTool, 'setActive').and.callFake(() => {
    });
    spyOn(mockScaleTool, 'setInactive').and.callFake(() => {
    });
    spyOn(mockWizardTool, 'setInactive').and.callFake(() => {
    });
  });


  it('should create ToolbarComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set clicked tool as active if no tool is active', () => {
    expect(component.activeTool).toEqual(undefined);
    component.setTool(mockScaleTool);
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockScaleTool);
    expect(mockScaleTool.setActive).toHaveBeenCalled();
    expect(component.activeTool).not.toEqual(mockWizardTool);
  });

  it('should set clicked tool as active if other tool was active', () => {
    component.activeTool = mockScaleTool;
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockScaleTool);
    component.setTool(mockWizardTool);
    expect(mockScaleTool.setInactive).toHaveBeenCalled();
    expect(mockWizardTool.setActive).toHaveBeenCalled();
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).not.toEqual(mockScaleTool);
    expect(component.activeTool).toEqual(mockWizardTool);
  });

  it('should set clicked tool as inactive if the same tool was active', () => {
    component.activeTool = mockWizardTool;
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockWizardTool);
    component.setTool(mockWizardTool);
    expect(mockWizardTool.setInactive).toHaveBeenCalled();
    expect(component.activeTool).toBeUndefined();
    expect(component.activeTool).not.toEqual(mockWizardTool);
  });

});
