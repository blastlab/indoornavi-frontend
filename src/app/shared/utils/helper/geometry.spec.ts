import {Geometry, NearestPoint} from './geometry';
import {Line, Point} from '../../../map-editor/map.type';
import {Area} from '../../../map-editor/tool-bar/tools/area/area.type';

const precisionRound = (number: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

// given, when
const p1: Point = {x: 1, y: 1},
      p2: Point = {x: 2, y: 2},
      p3: Point = {x: 3, y: 1},
      p4: Point = {x: 1, y: 2},
      p5: Point = {x: 5, y: 5},
      p6: Point = {x: 4, y: 5};

const area: Area = {
  id: null,
  name: null,
  configurations: [],
  buffer: null,
  heightMin: null,
  heightMax: null,
  floorId: null,
    points: [
      {x: 966, y: 82},
      {x: 1067, y: 160},
      {x: 1073, y: 247},
      {x: 1037, y: 316},
      {x: 873, y: 308},
      {x: 854, y: 199},
      {x: 936, y: 135},
      {x: 881, y: 68}
    ]
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
    // given
    const line0 = {startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}};
    const line1 = {startPoint: {x: 10, y: 0}, endPoint: {x: 0, y: 10}};
    // when
    const point0: Point = Geometry.findLineToLineIntersection(line0, line1);
    // then
    expect(point0.x).toEqual(5);
    expect(point0.y).toEqual(5);
  });

  it('should return lines intersection point 5, 5', () => {
    // given
    const line0 = {startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}};
    const line1 = {startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 0}};
    // when
    const point1: Point = Geometry.findLineToLineIntersection(line0, line1);
    // then
    expect(point1.x).toEqual(5);
    expect(point1.y).toEqual(5);
  });

  it('should return lines intersection point 38, 38', () => {
    // given
    const line0 = {startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}};
    const line1 = {startPoint: {x: 70, y: 10}, endPoint: {x: 10, y: 66}};
    // when
    const point2: Point = Geometry.findLineToLineIntersection(line0, line1);
    // then
    expect(point2.x).toEqual(38);
    expect(point2.y).toEqual(38);
  });

  it('should return lines intersection point 38, 38', () => {
    // given
    const line0 = {startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}};
    const line1 = {startPoint: {x: 10, y: 66}, endPoint: {x: 70, y: 10}};
    // when
    const point3: Point = Geometry.findLineToLineIntersection(line0, line1);
    // then
    expect(point3.x).toEqual(38);
    expect(point3.y).toEqual(38);
  });

  it('should not return lines intersection point but null', () => {
    // given
    const line0 = {startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}};
    const line1 = {startPoint: {x: 20, y: 20}, endPoint: {x: 30, y: 30}};
    const line2 = {startPoint: {x: 0, y: 0}, endPoint: {x: 10, y: 10}};
    const line3 = {startPoint: {x: 0, y: 0}, endPoint: {x: 30, y: 30}};
    const line4 = {startPoint: {x: 0, y: 0}, endPoint: {x: 100, y: 100}};
    const line5 = {startPoint: {x: 0, y: 70}, endPoint: {x: 40, y: 60}};
    // when
    const point0: Point = Geometry.findLineToLineIntersection(line0, line1);
    const point1: Point = Geometry.findLineToLineIntersection(line2, line3);
    const point2: Point = Geometry.findLineToLineIntersection(line4, line5);
    // then
    expect(point0).toBeNull();
    expect(point1).toBeNull();
    expect(point2).toBeNull();
  });

  it('should return crossing point of given line and imaginary perpendicular line', () => {
    // given
    const line0 = {startPoint: {x: 0, y: 10}, endPoint: {x: 10, y: 10}};
    const line1 = {startPoint: {x: 10, y: 0}, endPoint: {x: 10, y: 10}};
    const line2 = {startPoint: {x: 1, y: 1}, endPoint: {x: 6, y: 6}};
    const line3 = {startPoint: {x: 1, y: 1}, endPoint: {x: 13, y: 5}};
    const givenPoint0 = {x: 5, y: 5};
    const givenPoint1 = {x: 6, y: 3};
    const givenPoint2 = {x: 4, y: 11};
    // when
    const point0: Point = Geometry.findClosestPointOnLine(line0, givenPoint0);
    const point1: Point = Geometry.findClosestPointOnLine(line1, givenPoint0);
    const point2: Point = Geometry.findClosestPointOnLine(line2, givenPoint1);
    const point3: Point = Geometry.findClosestPointOnLine(line3, givenPoint2);
    // then
    expect(Math.round(point0.x)).toEqual(5);
    expect(Math.round(point0.y)).toEqual(10);
    expect(Math.round(point1.x)).toEqual(10);
    expect(Math.round(point1.y)).toEqual(5);
    expect(Math.round(point2.x)).toEqual(5);
    expect(Math.round(point2.y)).toEqual(5);
    expect(Math.round(point3.x)).toEqual(7);
    expect(Math.round(point3.y)).toEqual(3);
  });

  it('should to return end point of section', () => {
    // given
    const section0: Line = {startPoint: {x: -6, y: 6}, endPoint: {x: 6, y: 6}};
    const point0: Point = {x: 9, y: 5};
    // when
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section0, point0);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(3);
  });

  it('should to return point that is on intersection of perpendicular line to section and given section', () => {
    // given
    const point1: Point = {x: 5, y: 2};
    const section1: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // when
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section1, point1);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(4);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(4);
    expect(Math.round(foundLocation.distance)).toEqual(2);

  });

  it('should to return start point of section when closest point is outside section and distance is 3', () => {
    // given
    const point2: Point = {x: 8, y: 4};
    const section2: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // when
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section2, point2);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(3);
  });

  it('should to return start point of section when closest point is outside section and distance is 4', () => {
    // given
    const point3: Point = {x: 9, y: 9};
    const section3: Line = {startPoint: {x: 6, y: 6}, endPoint: {x: 0, y: 0}};
    // when
    const foundLocation: NearestPoint = Geometry.pickNearestPoint(section3, point3);
    // then
    expect(Math.round(foundLocation.coordinates.x)).toEqual(6);
    expect(Math.round(foundLocation.coordinates.y)).toEqual(6);
    expect(Math.round(foundLocation.distance)).toEqual(4);
  });

  it('should to return same point as given as closest point on path' , () => {
    // given
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
    const givenPoint0: Point = {x: 1, y: 9};
    const givenPoint1: Point = {x: 4, y: 9};
    const givenPoint2: Point = {x: 7, y: 9};
    const givenPoint3: Point = {x: 9, y: 9};
    // when
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    const foundPointOnPath2: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint2);
    const foundPointOnPath3: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint3);
    // then
    expect(foundPointOnPath0).toEqual(givenPoint0);
    expect(foundPointOnPath1).toEqual(givenPoint1);
    expect(foundPointOnPath2).toEqual(givenPoint2);
    expect(foundPointOnPath3).toEqual(givenPoint3);

  });

  it('should to return point of intersection of imaginary perpendicular line with closest section', () => {
    // given
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    const givenPoint0: Point = {x: 3, y: 2};
    const givenPoint1: Point = {x: 7, y: 5};
    // when
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    // then
    expect(foundPointOnPath0.x).toEqual(5);
    expect(foundPointOnPath0.y).toEqual(4);
    expect(foundPointOnPath1.x).toEqual(8);
    expect(foundPointOnPath1.y).toEqual(4);

  });

  it('should to return end point of line {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}', () => {
    // given
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    const givenPoint0: Point = {x: 0, y: 6};
    // when
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    // then
    expect(foundPointOnPath0.x).toEqual(2);
    expect(foundPointOnPath0.y).toEqual(6);
  });

  it('should return given point that belongs to line of given path', () => {
    // given
    const lines: Line[] = [
      {startPoint: {x: 2, y: 6}, endPoint: {x: 8, y: 0}},
      {startPoint: {x: 5, y: 1}, endPoint: {x: 12, y: 8}},
      {startPoint: {x: 5, y: 9}, endPoint: {x: 2, y: 6}}
    ];
    const givenPoint0: Point = {x: 12, y: 8};
    const givenPoint1: Point = {x: 7, y: 3};
    // when
    const foundPointOnPath0: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint0);
    const foundPointOnPath1: Point = Geometry.findPointOnPathInGivenRange(lines, givenPoint1);
    // then
    expect(foundPointOnPath0.x).toEqual(12);
    expect(foundPointOnPath0.y).toEqual(8);
    expect(foundPointOnPath1.x).toEqual(7);
    expect(foundPointOnPath1.y).toEqual(3);
  });

  it('should return true if point is on line between two points', () => {
    // given
    const line: Line = {
      startPoint: {x: 1, y: 1}, endPoint: {x: 5, y: 5}
    };
    const points: Point[] = [
      {x: 3, y: 3},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 4, y: 4}
    ];

    points.forEach(point => {
      // when
      const isPointOnLineBetweenTwoPoints = Geometry.isPointOnLineBetweenTwoPoints(line, point);
      // then
      expect(isPointOnLineBetweenTwoPoints).toBeTruthy()
    });
  });


  it('should return false if point is not between two points', () => {
    // given
    const line: Line = {
      startPoint: {x: 1, y: 1}, endPoint: {x: 5, y: 5}
    };
    const points: Point[] = [
      {x: 7, y: 5},
      {x: 2, y: 6},
      {x: 6, y: 7},
      {x: 0, y: 1}
    ];

    points.forEach(point => {
      // when
      const isPointOutsideTwoPointsOnLine = Geometry.isPointOnLineBetweenTwoPoints(line, point);
      // then
      expect(isPointOutsideTwoPointsOnLine).toBeFalsy()
    });
  });


  it('should return true if the point is within the area', () => {
    // given
    const points = [
      {point: {x: 886, y: 72}},
      {point: {x: 854, y: 199}},
      {point: {x: 966.5, y: 82.5}},
      {point: {x: 964, y: 237}}
    ];

    points.forEach((item) => {
      // when
      const isPointWithinArea = Geometry.isPointWithinArea(item.point, area);
      // then
      expect(isPointWithinArea).toBeTruthy();
    });
  });

  it('should return false if the point is out of the area', () => {
    // given
    const points = [
      {point: {x: 0, y: 0}},
      {point: {x: 966, y: 82}},
      {point: {x: 853.5, y: 198.5}},
      {point: {x: Infinity, y: -Infinity}},
      {point: {x: -40, y: -20}}
    ];

    points.forEach((item) => {
      // when
      const isPointWithinArea = Geometry.isPointWithinArea(item.point, area);
      // then
      expect(isPointWithinArea).toBeFalsy();
    });
  });
});
