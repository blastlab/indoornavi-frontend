import {Geometry} from './geometry';
import {Line, Point} from '../../../map-editor/map.type';

// when, given
const p0: Point = {x: 0, y: 0},
      p1: Point = {x: 1, y: 1},
      p2: Point = {x: 2, y: 2},
      p3: Point = {x: 3, y: 1},
      p4: Point = {x: 1, y: 2},
      p5: Point = {x: 5, y: 5},
      p6: Point = {x: 4, y: 5},
      line1: Line = {p1, p2},
      line2: Line = {p2, p1};

const precisionRound = (number: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

describe('Geometry', () => {
  it('should return slope value', () => {
    // then
    expect(Geometry.getSlope(p1, p2)).toEqual(1);
    expect(Geometry.getSlope(p2, p3)).toEqual(-1);
    expect(Geometry.getSlope(p2, p2)).toEqual(NaN);
    expect(Geometry.getSlope(p1, p4)).toEqual(-Infinity);
    expect(Geometry.getSlope(p4, p1)).toEqual(Infinity);
  });
  it('should return delta Y', () => {
    // then
    expect(precisionRound(Geometry.getDeltaY(p1, p2), 0)).toEqual(1);
    expect(precisionRound(Geometry.getDeltaY(p1, p5), 0)).toEqual(4);
    // tangent returns infinity so should return null
    expect(Geometry.getDeltaY(p1, p4)).toEqual(null);
    // tangent returns value very close to 0
    expect(precisionRound(Geometry.getDeltaY(p1, p3), 5)).toEqual(-0);

  });

  it('should return horizontal ending offset value', () => {
    line1.p1 = p1;
    line1.p2 = p2;
    line2.p1 = p1;
    line2.p2 = p1;
    // then
    // should be close to sqrt from 2
    expect(precisionRound(Geometry.getHorizontalEndingOffset(line1, 2), 2)).toEqual(1.41);
    // should be close to sqrt from 2
    expect(precisionRound(Geometry.getHorizontalEndingOffset(line1, 8), 2)).toEqual(5.66);

    // should return 0
    expect(Geometry.getHorizontalEndingOffset(line2, 5)).toEqual(0);
  });

  it('should return distance between given points', () => {
    // then

    // should be close to sqrt from 2
    expect(precisionRound(Geometry.getDistanceBetweenTwoPoints(p1, p2), 2)).toEqual(1.41);
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

  it('should return distance in pixels', () => {
    expect(Geometry.calculateDistanceInPixels(1999, 1999, 1)).toEqual(1);
    expect(Geometry.calculateDistanceInPixels(100, 200, 2)).toEqual(1);
  });

  it('should return distance in centimeters', () => {
    expect(Geometry.calculateDistanceInCentimeters(1999, 1999, 1)).toEqual(1);
    expect(Geometry.calculateDistanceInCentimeters(200, 100, 2)).toEqual(1);
  });

  it('should return point position in pixels', () => {
    expect(Geometry.calculatePointPositionInPixels(100, 50, p1).x).toEqual(p2.x);
    expect(Geometry.calculatePointPositionInPixels(200, 100, p1).y).toEqual(p2.y);
  });

  it('should return point position in centimeters', () => {
    expect(Geometry.calculatePointPositionInCentimeters(100, 50, p2).x).toEqual(p1.x);
    expect(Geometry.calculatePointPositionInCentimeters(200, 100, p2).y).toEqual(p1.y);
  });

});

