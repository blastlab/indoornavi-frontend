
import {Geometry} from './geometry';
import {Line, Point} from '../../../map-editor/map.type';
// when, given
const p1: Point = {x: 1, y: 1},
      p2: Point = {x: 2, y: 2},
      p3: Point = {x: 3, y: 1},
      p4: Point = {x: 1, y: 2},
      p5: Point = {x: 5, y: 5},
      p6: Point = {x: 4, y: 5},
      line1: Line = {p1, p2},
      line2: Line = {p1, p2};

describe('Geometry', () => {
  it('should return slope value', () => {
    // than
    expect(Geometry.getSlope(p1, p2)).toEqual(1);
    expect(Geometry.getSlope(p2, p3)).toEqual(-1);
    expect(Geometry.getSlope(p2, p2)).toEqual(NaN);
    expect(Geometry.getSlope(p1, p4)).toEqual(-Infinity);
    expect(Geometry.getSlope(p4, p1)).toEqual(Infinity);
  });
  it('should return delta Y', () => {
    // then

    // close to 1 in one decimal place
    expect(Geometry.getDeltaY(p1, p2)).toBeGreaterThan(.9);
    expect(Geometry.getDeltaY(p1, p2)).toBeLessThanOrEqual(1);
    // close to 4 in one decimal place
    expect(Geometry.getDeltaY(p1, p5)).toBeGreaterThan(3.9);
    expect(Geometry.getDeltaY(p1, p5)).toBeLessThanOrEqual(4);
    // tangent returns infinity so should return null
    expect(Geometry.getDeltaY(p1, p4)).toEqual(null);
    // tangent returns value very close to 0
    expect(Geometry.getDeltaY(p1, p3)).toBeLessThanOrEqual(.0009);

  });

  it('should return horizontal ending offset value', () => {
    line1.p1 = p1;
    line1.p2 = p2;
    line2.p1 = p1;
    line2.p2 = p1;
    // then
    // should be close to sqrt from 2
    expect(Geometry.getHorizontalEndingOffset(line1, 2)).toBeGreaterThanOrEqual(1.41);
    expect(Geometry.getHorizontalEndingOffset(line1, 2)).toBeLessThanOrEqual(1.42);
    // should return 0
    expect(Geometry.getHorizontalEndingOffset(line2, 5)).toEqual(0);
  });

  it('should return distance between given points', () => {
    // then

    // should be close to sqrt from 2
    expect(Geometry.getDistanceBetweenTwoPoints(p1, p2)).toBeLessThanOrEqual(1.42);
    expect(Geometry.getDistanceBetweenTwoPoints(p1, p2)).toBeGreaterThanOrEqual(1.41);
    expect(Geometry.getDistanceBetweenTwoPoints(p1, p1)).toEqual(0);
    expect(Geometry.getDistanceBetweenTwoPoints(p1, p6)).toEqual(5);
  });

  it('should return arc in degrees', () => {
    // then

    expect(Geometry.calculateDegree(p1, p3)).toEqual(0);
    expect(Geometry.calculateDegree(p3, p1)).toEqual(180);
    expect(Geometry.calculateDegree(p4, p1)).toEqual(90);
    expect(Geometry.calculateDegree(p1, p4)).toEqual(270);
    expect(Geometry.calculateDegree(p1, p2)).toEqual(315);
    expect(Geometry.calculateDegree(p5, p1)).toEqual(135);
  });

});

