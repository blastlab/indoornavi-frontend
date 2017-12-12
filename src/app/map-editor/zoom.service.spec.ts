
import {Point} from './map.type';
import {ZoomService} from './zoom.service';

describe('ZoomService', () => {
  // given
  const p1: Point = {
    x: 0,
    y: 0
  };
  const p2: Point = {
    x: 10,
    y: 10
  };

  it('should return the same localization when no transformation where given', () => {
    // when
    const transformation = {x: 0, y: 0, k: 1};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(0);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(0);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(10);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(10);

  });

  it('should return transformation with proper values for x,y transformation only', () => {
    // when
    const transformation = {x: 10, y: 10, k: 1};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(-10);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(-10);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(0);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(0);

  });
  it('should return transformation with proper values for zoom transformation only', () => {
    // when
    const transformation = {x: 0, y: 0, k: 1.6};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(0);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(0);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(6.25);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(6.25);

  });

  it('should return transformation with proper values for x transformation only ', () => {
    // when
    const transformation = {x: 55, y: 0, k: 1};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(-55);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(0);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(-45);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(10);

  });

  it('should return transformation with proper values for y transformation only ', () => {
    // when
    const transformation = {x: 0, y: 55, k: 1};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(0);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(-55);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(10);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(-45);

  });

  it('should return transformation with proper values for all parameters in transition ', () => {
    // when
    const transformation = {x: 100, y: 100, k: 2};

    // then
    expect(ZoomService.calculateTransition(p1, transformation).x).toEqual(-50);
    expect(ZoomService.calculateTransition(p1, transformation).y).toEqual(-50);
    expect(ZoomService.calculateTransition(p2, transformation).x).toEqual(-45);
    expect(ZoomService.calculateTransition(p2, transformation).y).toEqual(-45);

  });

});
