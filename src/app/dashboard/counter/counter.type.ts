import {Timer} from '../../shared/utils/timer/timer';

export class CounterTimer extends Timer {
  constructor(callback: Function, millis: number, private shortId) {
    super(callback, millis);
  }

  public start(): void {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.callback(this.shortId);
      }, this.millis);
    }
  }
}
