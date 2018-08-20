import {Geometry, NearestPoint} from './geometry';
import {Line, Point} from '../../../map-editor/map.type';

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

  it('should return lines intersection point 5, 5', () => {
    // when, given
    const point0: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 10, y: 0}, endPoint: {x: 0, y: 10}});
    // then
    expect(point0.x).toEqual(5);
    expect(point0.y).toEqual(5);
  });

  it('should return lines intersection point 5, 5', () => {
    // when, given
    const point1: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 0}});
    // then
    expect(point1.x).toEqual(5);
    expect(point1.y).toEqual(5);
  });

  it('should return lines intersection point 38, 38', () => {
    // when, given
    const point2: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 70, y: 10}, endPoint: {x: 10, y: 66}});
    // then
    expect(point2.x).toEqual(38);
    expect(point2.y).toEqual(38);
  });

  it('should return lines intersection point 38, 38', () => {
    // when, given
    const point3: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 10, y: 66}, endPoint: {x: 70, y: 10}});
    // then
    expect(point3.x).toEqual(38);
    expect(point3.y).toEqual(38);
  });

  it('should not return lines intersection point but null', () => {
    // when, given
    const point0: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 20, y: 20}, endPoint: {x: 30, y: 30}});
    const point1: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}}, {startPoint: {x: 0, y: 0}, endPoint: {x: 30, y: 30}});
    const point2: Point = Geometry.findLineToLineIntersection({startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}}, {startPoint: {x: 0, y: 70}, endPoint: {x: 40, y: 60}});
    // then
    expect(point0).toBeNull();
    expect(point1).toBeNull();
    expect(point2).toBeNull();
  });

  it('should return crossing point of given line and imaginary perpendicular line', () => {
    // when, given
    const point0: Point = Geometry.findClosestPointOnLine({startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 10}}, {x: 5, y: 5});
    const point1: Point = Geometry.findClosestPointOnLine({startPoint: {x: 10, y: 0}, endPoint: {x: 10, y: 10}}, {x: 5, y: 5});
    const point2: Point = Geometry.findClosestPointOnLine({startPoint: {x: 1, y: 1}, endPoint: {x: 6, y: 6}}, {x: 6, y: 3});
    const point3: Point = Geometry.findClosestPointOnLine({startPoint: {x: 1, y: 1}, endPoint: {x: 13, y: 5}}, {x: 4, y: 11});
    // then
    expect(Math.round(point0.x)).toEqual(5);
    expect(Math.round(point0.y)).toEqual(10);
    // then
    expect(Math.round(point1.x)).toEqual(10);
    expect(Math.round(point1.y)).toEqual(5);
    // then
    expect(Math.round(point2.x)).toEqual(5);
    expect(Math.round(point2.y)).toEqual(5);
    // then
    expect(Math.round(point3.x)).toEqual(7);
    expect(Math.round(point3.y)).toEqual(3);
  });

  it('should to return end point of section', () => {
    // when
    const section0: Line = {startPoint: {x: -6, y: 6}, endPoint: {x: 6, y: 6}};
    const point0: Point = {x: 9, y: 5};
    // given
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section0, point0);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(3);
  });

  it('should to return point that is on intersection of perpendicular line to section and given section', () => {
    // when
    const point1: Point = {x: 5, y: 2};
    const section1: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // given
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section1, point1);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(4);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(4);
    expect(Math.round(foundLocation.distance)).toEqual(2);

  });

  it('should to return start point of section', () => {
    // when
    const point2: Point = {x: 8, y: 4};
    const section2: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // given
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section2, point2);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(3);

  });

  it('should to return start point of section', () => {
    // when
    const point3: Point = {x: 9, y: 9};
    const section3: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // given
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section3, point3);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(4);
  });

  it('should to return same point as given as closest point on path' , () => {
    const lines: Line[] = [];
    for (let x = 0; x <= 10; x++) {
      lines.push({
        startPoint: {
          x: 0,
          y: 0
        },
        endPoint: {
          x: x,
          y: 10
        }
      })
    }
    // given
    const givenPoint0: Point = {x: 1, y: 9};
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    // then
    expect(foundPointOnPath0).toEqual(givenPoint0);

    // given
    const givenPoint1: Point = {x: 4, y: 9};
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    // then
    expect(foundPointOnPath1).toEqual(givenPoint1);

    // given
    const givenPoint2: Point = {x: 7, y: 9};
    const foundPointOnPath2: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint2);
    // then
    expect(foundPointOnPath2).toEqual(givenPoint2);

    // given
    const givenPoint3: Point = {x: 9, y: 9};
    // then
    const foundPointOnPath3: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint3);
    expect(foundPointOnPath3).toEqual(givenPoint3);
  });

  it('should to return point of intersection of imaginary perpendicular line with closest section', () => {
    // when
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    // given
    const givenPoint0: Point = {x: 3, y: 2};
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    // then
    expect(foundPointOnPath0.x).toEqual(5);
    expect(foundPointOnPath0.y).toEqual(4);

    // given
    const givenPoint1: Point = {x: 7, y: 5};
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    // then
    expect(foundPointOnPath1.x).toEqual(8);
    expect(foundPointOnPath1.y).toEqual(4);

  });

  it('should to return end point of line {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}', () => {
    // when
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    // given
    const givenPoint0: Point = {x: 0, y: 6};
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    // then
    expect(foundPointOnPath0.x).toEqual(2);
    expect(foundPointOnPath0.y).toEqual(6);
  });

  it('should return given point that belongs to line of given path', () => {
    // when
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    // given
    const givenPoint0: Point = {x: 12, y: 8};
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    // then
    expect(foundPointOnPath0.x).toEqual(12);
    expect(foundPointOnPath0.y).toEqual(8);

    // given
    const givenPoint1: Point = {x: 7, y: 3};
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    // then
    expect(foundPointOnPath1.x).toEqual(7);
    expect(foundPointOnPath1.y).toEqual(3);
  });


});

