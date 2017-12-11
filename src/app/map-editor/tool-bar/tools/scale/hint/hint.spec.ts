import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ScaleHintComponent} from './hint';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ScaleHintService} from './hint.service';
import {Measure, Scale} from '../scale.type';
import {Point} from '../../../../map.type';
import {BrowserModule, DOCUMENT} from '@angular/platform-browser';
import {AuthGuard} from '../../../../../auth/auth.guard';
import {ScaleService} from '../scale.service';

describe('ScaleHintComponent', () => {
  let component: ScaleHintComponent;
  let fixture: ComponentFixture<ScaleHintComponent>;
  let scaleHintService: ScaleHintService;
  let translateService: TranslateService;
  let document: Document;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleHintComponent],
      imports: [
        TranslateModule.forRoot(), BrowserModule
      ],
      providers: [
        ScaleHintService, TranslateService, AuthGuard, ScaleService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    scaleHintService = fixture.debugElement.injector.get(ScaleHintService);
    translateService = fixture.debugElement.injector.get(TranslateService);
    document = fixture.debugElement.injector.get(DOCUMENT);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should show \'Scale is not set\'', (done: DoneFn) => {
    // given
    let translation = '';
    spyOn(component, 'showScaleValue').and.callThrough();
    translateService.get('scale.isNotSet').subscribe((value: string) => {
      translation = value;
      done();
    });
    // when
    scaleHintService.publishScale(null);
    // then
    expect(document.getElementById('scaleHint').innerText).toEqual(translation);
    expect(component.showScaleValue).toHaveBeenCalled();
  });

  it('Should show scale value', (done: DoneFn) => {
    // given
    const scale = <Scale>{
      start: <Point>{
        x: 123,
        y: 456
      },
      stop: <Point>{
        x: 789,
        y: 101
      },
      realDistance: 112,
      measure: Measure.METERS
    };
    let translation = '';
    spyOn(component, 'showScaleValue').and.callThrough();
    translateService.get('scale').subscribe((value: string) => {
      translation = value;
      done();
    });
    // when
    scaleHintService.publishScale(scale);
    // then
    expect(component.showScaleValue).toHaveBeenCalled();
    expect(document.getElementById('scaleHint').innerText).toEqual(translation + ': ' + scale.realDistance + ' m');
  });
});