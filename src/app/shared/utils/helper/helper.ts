import {Point} from '../../../map-editor/map.type';

export class Helper {

  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // this is a special way to make a deep copy
  }

  static getChildrenExtremeValues(parentElement: SVGElement): Point {
    let extremeLeftX = 0;
    let extremeTopY = 0;
    const childrenCount: number = parentElement.childElementCount;
    const children: NodeList = parentElement.childNodes;
    for (let i = 0; i < childrenCount; i++) {
      if (!!children[i]['attributes']['class'] && children[i]['attributes']['class'].value !== 'dragarea') {
        const childX: number = children[i]['attributes']['x'].value;
        const childY: number = children[i]['attributes']['y'].value;
        extremeLeftX = (childX < extremeLeftX) ? childX : extremeLeftX;
        extremeTopY = (childY < extremeTopY) ? childY : extremeTopY;
      }
    }
    return {x: extremeLeftX, y: extremeTopY};
  }

  static respondToOrigin(event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }

}
