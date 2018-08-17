import {Geometry} from './geometry';
import {Point} from '../../../map-editor/map.type';

const precisionRound = (number: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

// when, given
const p1: Point = {x: 1, y: 1},
      p2: Point = {x: 2, y: 2},
      p3: Point = {x: 3, y: 1},
      p4: Point = {x: 1, y: 2},
      p5: Point = {x: 5, y: 5},
      p6: Point = {x: 4, y: 5};

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
    // then
    // should be close to sqrt from 2
    expect(precisionRound(Geometry.getHorizontalEndingOffset({startPoint: p1, endPoint: p2}, 2), 2)).toEqual(1.41);
    // should be close to sqrt from 2
    expect(precisionRound(Geometry.getHorizontalEndingOffset({startPoint: p1, endPoint: p2}, 8), 2)).toEqual(5.66);

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
    // then
    expect(Geometry.calculateDistanceInPixels(1999, 1999, 1)).toEqual(1);
    expect(Geometry.calculateDistanceInPixels(100, 200, 2)).toEqual(1);
  });

  it('should return distance in centimeters', () => {
    // then
    expect(Geometry.calculateDistanceInCentimeters(1999, 1999, 1)).toEqual(1);
    expect(Geometry.calculateDistanceInCentimeters(200, 100, 2)).toEqual(1);
  });

  it('should return point position in pixels', () => {
    // then
    expect(Geometry.calculatePointPositionInPixels(100, 50, p1).x).toEqual(p2.x);
    expect(Geometry.calculatePointPositionInPixels(200, 100, p1).y).toEqual(p2.y);
  });

  it('should return point position in centimeters', () => {
    // then
    expect(Geometry.calculatePointPositionInCentimeters(100, 50, p2).x).toEqual(p1.x);
    expect(Geometry.calculatePointPositionInCentimeters(200, 100, p2).y).toEqual(p1.y);
  });

  it('should return true for the same coordinates', () => {
    expect(Geometry.isSamePoint({x: 10, y: 10}, {x: 10, y: 10})).toBeTruthy();
    expect(Geometry.isSamePoint({x: 0, y: 0}, {x: 0, y: 0})).toBeTruthy();
  });

  it('should return false for different coordinates', () => {
    expect(Geometry.isSamePoint({x: 10, y: 0}, {x: 10, y: 10})).toBeFalsy();
    expect(Geometry.isSamePoint({x: 0, y: 10}, {x: 10, y: 10})).toBeFalsy();
    expect(Geometry.isSamePoint({x: 10, y: 10}, {x: 0, y: 0})).toBeFalsy();
  });

  it('should return findLineToLineIntersection point', () => {
    const point0: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 10, y: 0}, endPoint: {x: 0, y: 10}});
    expect(point0.x).toEqual(5);
    expect(point0.y).toEqual(5);
    const point1: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 0}});
    expect(point1.x).toEqual(5);
    expect(point1.y).toEqual(5);
    const point2: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 70, y: 10}, endPoint: {x: 10, y: 66}});
    expect(point2.x).toEqual(38);
    expect(point2.y).toEqual(38);
    const point3: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 10, y: 66}, endPoint: {x: 70, y: 10}});
    expect(point3.x).toEqual(38);
    expect(point3.y).toEqual(38);
  });

  it('should not return findLineToLineIntersection point but null', () => {
    const point0: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 20, y: 20}, endPoint: {x: 30, y: 30}});
    expect(point0).toBeNull();
    const point1: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 0, y: 0}, endPoint: {x: 30, y: 30}});
    expect(point1).toBeNull();
    const point2: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 0, y: 70}, endPoint: {x: 40, y: 60}});
    expect(point2).toBeNull();
  });

  it('', () => {
    const point0: Point = Geometry.findClosestPointOnLine({startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 10}}, {x: 5, y: 5});
    expect(point0.x).toEqual(5);
    expect(point0.y).toEqual(10);
    const point1: Point = Geometry.findClosestPointOnLine({startPoint: {x: 10, y: 0}, endPoint: {x: 10, y: 10}}, {x: 5, y: 5});
    expect(point1.x).toEqual(10);
    expect(point1.y).toEqual(5);
    const point2: Point = Geometry.findClosestPointOnLine({startPoint: {x: 1, y: 1}, endPoint: {x: 6, y: 6}}, {x: 6, y: 3});
    expect(point2.x).toEqual(5);
    expect(point2.y).toEqual(5);
    const point3: Point = Geometry.findClosestPointOnLine({startPoint: {x: 1, y: 1}, endPoint: {x: 13, y: 5}}, {x: 4, y: 11});
    expect(point3.x).toEqual(7);
    expect(point3.y).toEqual(3);
  });

});

