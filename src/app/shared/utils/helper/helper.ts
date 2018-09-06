export class Helper {

  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // this is a special way to make a deep copy
  }
}

