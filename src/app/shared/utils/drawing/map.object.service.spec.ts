import {MapObjectService, Position, Box} from './map.object.service';
import * as d3 from 'd3';
import {InfoWindowGroupWrapper} from './drawing.builder';
// when
const svgElement = d3.select().append('svg');
const infoWindowGroupWrapper = new InfoWindowGroupWrapper(svgElement);

// given

infoWindowGroupWrapper.height = 200;
infoWindowGroupWrapper.width = 200;

// mocking MapObject
class MapObject {
  constructor(private x: number, private y: number, private width: number, private height: number) {

  }

  getGroup(): MapObject {
    return this;
  }

  node(): MapObject {
    return this;
  }

  getBBox(): Box {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }
  }
}

const mapObject = new MapObject(10, 10, 100, 100);

// then
describe('info window', () => {
  it('should return coordinates on the TOP of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP).x).toEqual(-40);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP).y).toEqual(-190);
  });
  it('should return coordinates on the BOTTOM of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM).x).toEqual(-40);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM).y).toEqual(110);
  });
  it('should return coordinates on the TOP_RIGHT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_RIGHT).x).toEqual(110);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_RIGHT).y).toEqual(-190);
  });
  it('should return coordinates on the TOP_LEFT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_LEFT).x).toEqual(-190);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_LEFT).y).toEqual(-190);
  });
  it('should return coordinates on the BOTTOM_RIGHT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_RIGHT).x).toEqual(110);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_RIGHT).y).toEqual(110);
  });
  it('should return coordinates on the BOTTOM_LEFT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_LEFT).x).toEqual(-190);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_LEFT).y).toEqual(110);
  });
  it('should return coordinates on the LEFT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.LEFT).x).toEqual(-190);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.LEFT).y).toEqual(-40);
  });
  it('should return coordinates on the RIGHT of given object', () => {
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.RIGHT).x).toEqual(110);
    expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.RIGHT).y).toEqual(-40);
  });
});
