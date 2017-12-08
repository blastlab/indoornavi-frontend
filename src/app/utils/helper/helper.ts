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
      const childX = children[i].attributes['x'].value;
      const childY = children[i].attributes['y'].value;
      extremeLeftX = ( childX < extremeLeftX) ? childX : extremeLeftX;
      extremeTopY = ( childY < extremeTopY) ? childY : extremeTopY;
    }
    return {x: extremeLeftX, y: extremeTopY};
  }
}
