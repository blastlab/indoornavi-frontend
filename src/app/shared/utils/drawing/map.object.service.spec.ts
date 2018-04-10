import {MapObjectService, Position} from './map.object.service';
import {InfoWindowGroupWrapper} from './drawing.builder';
import * as d3 from 'd3';

// when
const svgElement = d3.select().append('svg');
const infoWindowGroupWrapper = new InfoWindowGroupWrapper(svgElement);

// given

infoWindowGroupWrapper.height = 200;
infoWindowGroupWrapper.width = 200;

class MpObject {

  constructor(private x: number, private y: number, private width: number, private height: number){};

  getGroup(): {

  }
}

// then
describe('info window', () => {
  // it('should return coordinates on the TOP of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP).x).toEqual(-45);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP).y).toEqual(-215);
  // });
  // it('should return coordinates on the BOTTOM of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM).x).toEqual(-45);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM).y).toEqual(100);
  // });
  // it('should return coordinates on the TOP_RIGHT of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_RIGHT).x).toEqual(100);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_RIGHT).y).toEqual(-215);
  // });
  // it('should return coordinates on the TOP_LEFT of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_LEFT).x).toEqual(-190);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.TOP_LEFT).y).toEqual(-215);
  // });
  // it('should return coordinates on the BOTTOM_RIGHT of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_RIGHT).x).toEqual(100);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_RIGHT).y).toEqual(100);
  // });
  // it('should return coordinates on the BOTTOM_LEFT of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_LEFT).x).toEqual(-190);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.BOTTOM_LEFT).y).toEqual(100);
  // });
  // it('should return coordinates on the LEFT of given object', () => {
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.LEFT).x).toEqual(-200.5);
  //   expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject, Position.LEFT).y).toEqual(-45);
  // });
  // it('should return coordinates on the RIGHT of given object', () => {
  //   // expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject.points, Position.RIGHT).x).toEqual(-190);
    // expect(MapObjectService.calculateInfoWindowPosition(infoWindowGroupWrapper, mapObject.points, Position.RIGHT).y).toEqual(100);
  });
});
