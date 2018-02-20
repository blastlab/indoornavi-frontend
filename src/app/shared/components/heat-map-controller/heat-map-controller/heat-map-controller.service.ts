import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class HeatMapControllerService {
  private playingAnimation: Subject<boolean> = new Subject<boolean>();
  private heatMapWaterfallDisplayTime: Subject<number> = new Subject<number>();
  private heatTimeGap: Subject<number> = new Subject<number>();

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

}
