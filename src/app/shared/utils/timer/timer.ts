export class Timer {
  protected interval: any;

  constructor(protected callback: Function, protected millis: number) {
    this.interval = setInterval(callback, millis);
  }

  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  public start(): void {
    if (!this.interval) {
      this.interval = setInterval(this.callback, this.millis);
    }
  }

  public restart(): void {
    this.stop();
    this.start();
  }
}
