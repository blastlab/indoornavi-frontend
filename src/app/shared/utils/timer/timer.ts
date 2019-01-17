export class Timer {
  protected interval: any;

  constructor(protected callback: Function, protected millis: number) {
    this.start();
  }

  public stop(): void {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
  }

  public start(): void {
    if (!this.interval) {
      this.interval = setTimeout(() => {
        this.callback();
        this.restart();
      }, this.millis);
    }
  }

  public startNow(): void {
    if (!this.interval) {
      this.interval = setTimeout(() => {
        this.callback();
        this.restart();
      }, 0);
    }
  }

  public restart(): void {
    this.stop();
    this.start();
  }
}
