export class Timer {
  protected interval: any;

  constructor(protected callback: Function, protected millis: number) {
    this.interval = setTimeout(() => {
      this.callback();
      this.start();
    }, millis);
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
        this.start();
      }, this.millis);
    }
  }

  public restart(): void {
    this.stop();
    this.start();
  }
}
