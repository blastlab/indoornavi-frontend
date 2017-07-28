import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AnchorPlacerComponent} from './anchor-placer';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {RemainingDevicesListComponent} from './remaining-devices-list/remaining-devices-list';
import {AuthGuard} from '../../../../auth/auth.guard';
import {DndModule} from 'ng2-dnd';
import {SharedModule} from 'app/utils/shared/shared.module';

describe('AnchorPlacerComponent', () => {
  let component: AnchorPlacerComponent;
  let fixture: ComponentFixture<AnchorPlacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DndModule.forRoot(), MaterialModule, SharedModule],
      declarations: [AnchorPlacerComponent, RemainingDevicesListComponent],
      providers: [AuthGuard]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnchorPlacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
