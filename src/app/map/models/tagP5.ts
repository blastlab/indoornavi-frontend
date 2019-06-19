import * as P5 from 'p5';

export class TagP5 {

  private static WIDTH = 15;
  private static HEIGHT = 15;
  private static SECONDS_AFTER_WHICH_TAG_SHOULD_BE_OUTDATED = 3;
  private static MILLISECONDS_BLINKING_TIME = 1500;
  private static FONT_SIZE = 12;

  private destination: P5.Vector;
  private tick: number = 1;
  private readonly defaultColor: P5.Color;
  private readonly blinkingColor: P5.Color;
  private readonly borderColor: P5.Color;
  private readonly textColor: P5.Color;
  private isNew: boolean = true;
  private lastTimeUpdated: Date;

  constructor(private p: P5, private x: number, private y: number, private tagId: number) {
    this.defaultColor = this.p.color(80, 150, 255, 180);
    this.blinkingColor = this.p.color(255, 60, 60, 180);
    this.borderColor = this.p.color(0, 100, 255);
    this.textColor = this.p.color(0, 0, 0);
    setTimeout(() => {
      this.isNew = false;
    }, TagP5.MILLISECONDS_BLINKING_TIME);
    this.lastTimeUpdated = new Date();
    this.draw();
  }

  setDestination(x: number, y: number): void {
    this.destination = this.p.createVector(x, y);
    this.tick = 0;
    this.lastTimeUpdated = new Date();
  }

  updatePosition(): TagP5 {
    this.tick++;
    let currentPosition = this.p.createVector(this.x, this.y);
    currentPosition = currentPosition.lerp(this.destination, (this.tick / 20));
    this.x = currentPosition.x;
    this.y = currentPosition.y;
    return this;
  }

  draw(): boolean {
    if (this.isOutdated()) {
      return false;
    }
    this.drawEllipse();
    this.drawText();
    return true;
  }

  private isOutdated(): boolean {
    const now = new Date();
    now.setSeconds(now.getSeconds() - TagP5.SECONDS_AFTER_WHICH_TAG_SHOULD_BE_OUTDATED);
    return this.lastTimeUpdated < now;
  }

  private drawEllipse(): void {
    this.p.stroke(this.borderColor);
    if (this.isNew) {
      this.p.fill(this.tick % 2 === 0 ? this.defaultColor : this.blinkingColor);
    } else {
      this.p.fill(this.defaultColor);
    }
    this.p.ellipse(this.x, this.y, TagP5.WIDTH, TagP5.HEIGHT);
  }

  private drawText(): void {
    this.p.fill(this.textColor);
    this.p.stroke(this.textColor);
    this.p.textSize(TagP5.FONT_SIZE);
    this.p.textAlign(this.p.CENTER);
    this.p.text(this.tagId, this.x, this.y - TagP5.FONT_SIZE);
  }
}
