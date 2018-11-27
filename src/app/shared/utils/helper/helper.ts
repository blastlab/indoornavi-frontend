import {APIObject} from '../drawing/api.types';
import Metadata = APIObject.Metadata;

export class Helper {

  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // this is a special way to make a deep copy
  }

  static detectMobile(): boolean {
    const mobileDevices = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i;
    return mobileDevices.test(navigator.userAgent);
  }

  static assignId(type: string): Metadata {
    return {
      object: {
        id: Math.round(new Date().getTime() * Math.random() * 1000)
      },
      type: type
    };
  }
}
