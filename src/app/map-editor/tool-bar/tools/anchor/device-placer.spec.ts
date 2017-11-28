import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {DevicePlacerComponent} from './device.placer';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {RemainingDevicesListComponent} from './map-anchors-list/map-anchors-list';
import {AuthGuard} from '../../../../auth/auth.guard';
import {DndModule} from 'ng2-dnd';
import {SharedModule} from 'app/utils/shared/shared.module';

describe('DevicePlacerComponent', () => {
  let component: DevicePlacerComponent;
  let fixture: ComponentFixture<DevicePlacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DndModule.forRoot(), MaterialModule, SharedModule],
      declarations: [DevicePlacerComponent, RemainingDevicesListComponent],
      providers: [AuthGuard]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePlacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
