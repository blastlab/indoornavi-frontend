import {Geometry} from './geometry';
import {Line, Point} from '../../../map-editor/map.type';

describe('Geometry', () => {
  // given, when
  const beginningPoint: Point = {x: 0 , y: 0};
  const endPoint: Point = {x: 300 , y: 400};
  const line: Line = {p1: beginningPoint, p2: endPoint};

  beforeEach(() => {
    // nothing to spyOn
  });
  it('should to calculate slope value between two points', () => {
    const division = 4 / 3;
    // then
    expect(Geometry.getSlope(beginningPoint, endPoint)).toEqual(division);
  });
  it('should to calculate distance between two points', () => {
    // then
    expect(Geometry.getDistanceBetweenTwoPoints(beginningPoint, endPoint)).toEqual(500);
  });
  it('should to calculate vertical offset value', () => {
    // then
    expect(Geometry.getVerticalEndingOffset(line, 100)).toBeLessThan(60.001);
    expect(Geometry.getVerticalEndingOffset(line, 100)).toBeGreaterThan(60);
    expect(Geometry.getVerticalEndingOffset(line, 0.1)).not.toEqual(60);
  });
  it('should to calculate vertical offset value', () => {
    // then
    expect(Geometry.getHorizontalEndingOffset(line, 100)).toBeLessThan(80.1);
    expect(Geometry.getHorizontalEndingOffset(line, 100)).toBeGreaterThan(79.999);
    expect(Geometry.getHorizontalEndingOffset(line, 0.1)).not.toEqual(80.001);
  });

});
