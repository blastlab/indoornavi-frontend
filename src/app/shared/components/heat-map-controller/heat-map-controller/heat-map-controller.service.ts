import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {HeatMapType} from './heat-map-controller.component';


@Injectable()
export class HeatMapControllerService {
  private playingAnimation: Subject<boolean> = new Subject<boolean>();
  private heatMapWaterfallDisplayTime: Subject<number> = new Subject<number>();
  private heatTimeGap: Subject<number> = new Subject<HeatMapType>();
  private heatMapType: Subject<number> = new Subject<HeatMapType>();

  constructor() { }

  onAnimationToggled (): Observable<boolean> {
    return this.playingAnimation.asObservable();
  }

  onHeatMapWaterfallDisplayTimesChange (): Observable<number> {
    return this.heatMapWaterfallDisplayTime.asObservable();
  }

  togglePlayingAnimation(animationToggle: boolean): void {
    this.playingAnimation.next(animationToggle);
  }

  setHeatMapWaterfallDisplayTime (timeSpan: number): void {
    this.heatMapWaterfallDisplayTime.next(timeSpan);
  }

  setHeatTimeGapChange (timeSpan: number): void {
    this.heatTimeGap.next(timeSpan);
  }

  onHeatMapTimeGapChange (): Observable<number> {
    return this.heatTimeGap.asObservable();
  }

  setHeatMapType(hexagonalType: HeatMapType): void {
    this.heatMapType.next(hexagonalType);
  }

  onHeaMapTypeChange(): Observable<HeatMapType> {
    return this.heatMapType.asObservable();
  }

}
