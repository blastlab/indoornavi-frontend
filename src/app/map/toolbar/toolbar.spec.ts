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

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let mockScaleTool: ScaleComponent;
  let mockWizardTool: WizardComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [ToolbarComponent, ScaleComponent, WizardComponent, FirstStepComponent, SecondStepComponent,
        ThirdStepComponent],
      providers: [
        SocketService, WebSocketService, ToastService, HintBarService, AcceptButtonsService, DrawingService,
        IconService, ScaleComponent, WizardComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockScaleTool = fixture.debugElement.injector.get(ScaleComponent);
    mockScaleTool.setActive = () => {
      component.activeTool = mockScaleTool;
    };
    mockWizardTool = fixture.debugElement.injector.get(WizardComponent);
    mockWizardTool.setActive = () => {
      component.activeTool = mockWizardTool;
    };
    mockWizardTool.setInactive = () => {
      // changes variable inside specific tool (active: boolean)
      // setting wizard inactive clears view - test in wizard.spec
    };
  });


  it('should create ToolbarComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set clicked tool as active if no tool is active', () => {
    expect(component.activeTool).toEqual(undefined);
    component.setTool(mockScaleTool);
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockScaleTool);
    expect(component.activeTool).not.toEqual(mockWizardTool);
  });

  it('should set clicked tool as active if other tool was active', () => {
    // don't expect here that activeTool is undefined
    component.activeTool = mockScaleTool;
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockScaleTool);
    component.setTool(mockWizardTool);
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).not.toEqual(mockScaleTool);
    expect(component.activeTool).toEqual(mockWizardTool);
  });

  it('should set clicked tool as inactive if the same tool was active', () => {
    component.activeTool = mockWizardTool;
    expect(component.activeTool).toBeDefined();
    expect(component.activeTool).toEqual(mockWizardTool);
    component.setTool(mockWizardTool);
    expect(component.activeTool).toBeUndefined();
    expect(component.activeTool).not.toEqual(mockWizardTool);
  });

});
