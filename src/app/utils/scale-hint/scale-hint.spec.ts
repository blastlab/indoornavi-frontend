import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ScaleHintComponent} from './scale-hint';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ScaleHintService} from './scale-hint.service';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Point} from '../../map/map.type';
import {BrowserModule, DOCUMENT} from '@angular/platform-browser';

describe('ScaleHintComponent', () => {
  let component: ScaleHintComponent;
  let fixture: ComponentFixture<ScaleHintComponent>;
  // let scale: Scale;
  let scaleHintService: ScaleHintService;
  let translateService: TranslateService;
  let document;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleHintComponent],
      imports: [
        TranslateModule.forRoot(), BrowserModule
      ],
      providers: [
        ScaleHintService, TranslateService
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
 /*   scale = <Scale>{
      start: <Point>{
        x: 123,
        y: 456
      },
      stop: <Point>{
        x: 789,
        y: 101
      },
      realDistance: 112,
      measure: MeasureEnum.METERS
    };*/
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should show \'Scale is not set\'', () => {
    // given
    let translation = '';
    spyOn(component, 'showScaleValue').and.callThrough();
    translateService.get('scale.isNotSet').subscribe((value: string) => {
      translation = value;
    });
    // when
    scaleHintService.publishScale(null);
    // then
    expect(document.getElementById('scaleHint').innerText).toEqual(translation);
    expect(component.showScaleValue).toHaveBeenCalled();
  });

  it('Should show scale value', () => {
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
      measure: MeasureEnum.METERS
    };
    let translation = '';
    spyOn(component, 'showScaleValue').and.callThrough();
    translateService.get('scale').subscribe((value: string) => {
      translation = value;
    });
    // when
    scaleHintService.publishScale(scale);
    // then
    expect(component.showScaleValue).toHaveBeenCalled();
    expect(document.getElementById('scaleHint').innerText).toEqual(translation + ': ' + scale.realDistance + ' m');
  });
});
