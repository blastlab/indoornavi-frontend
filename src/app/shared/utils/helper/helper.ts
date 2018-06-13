import {Point} from '../../../map-editor/map.type';
import * as d3 from 'd3';

export class Helper {

  static deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)); // this is a special way to make a deep copy
  }

  static getChildrenExtremeValues(parentElement: SVGElement): {x: number, y: number} {
    let extremeLeftX = 0;
    let extremeTopY = 0;
    const childrenCount: number = parentElement.childElementCount;
    const children: NodeList = parentElement.childNodes;
    for (let i = 0; i < childrenCount; i++) {
      if (!!children[i].attributes['class'] && children[i].attributes['class'].value !== 'dragarea') {
        const childX = children[i].attributes['x'].value;
        const childY = children[i].attributes['y'].value;
        extremeLeftX = ( childX < extremeLeftX) ? childX : extremeLeftX;
        extremeTopY = ( childY < extremeTopY) ? childY : extremeTopY;
      }
    }
    return {x: extremeLeftX, y: extremeTopY};
  }

  static respondToOrigin(event: number, id: number, originMessageEvent: MessageEvent): void {
    originMessageEvent.source.postMessage({type: `${event.toString(10)}-${id.toString(10)}`, objectId: id}, originMessageEvent.origin);
  }

  static getMousePosition(mapSvg): Point {
    const position: Array<number> = d3.mouse(mapSvg.container.node());
    return {x: Math.round(position[0]), y: Math.round(position[1])};
  }

}
