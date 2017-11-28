export class Device {
  id?: number;
  name?: string;
  shortId: number;
  longId?: number;
  verified: boolean;
  x?: number;
  y?: number;

  constructor(shortId: number, longId: number, verified: boolean, id?: number, name?: string, x?: number, y?: number) {
    this.id = id;
    this.name = name;
    this.shortId = shortId;
    this.longId = longId;
    this.verified = verified;
    this.x = x;
    this.y = y;
  }
}
