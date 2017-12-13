import {Point} from './map.type';
import {ZoomService} from './zoom.service';
import {MapViewerService} from './map.editor.service';


describe('ZoomService', () => {

  // it is necessary to test minimum two points,
  // as transformation vectors params vary according to which point We are taking to account
  // to understand zoom transformation think of it as on inflating a balloon,
  // each point on the balloon surface has unique transformation vector
  const p1: Point = {
    x: 0,
    y: 0
  };
  const p2: Point = {
    x: 10,
    y: 10
  };
  const zoomService = new ZoomService();

  it('should return the same localization when no transformation where given', () => {
    // given
    const transformation = {x: 0, y: 0, k: 1};

    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);


    // then
    expect(calculatedPoint_1.x).toEqual(0);
    expect(calculatedPoint_1.y).toEqual(0);
    expect(calculatedPoint_2.x).toEqual(10);
    expect(calculatedPoint_2.y).toEqual(10);

  });

  it('should return transformation with proper values for x and y transformation only', () => {
    // given
    const transformation = {x: 10, y: 10, k: 1};
    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);
    // then
    expect(calculatedPoint_1.x).toEqual(-10);
    expect(calculatedPoint_1.y).toEqual(-10);
    expect(calculatedPoint_2.x).toEqual(0);
    expect(calculatedPoint_2.y).toEqual(0);

  });
  it('should return transformation with proper values for zoom transformation only', () => {
    // given
    const transformation = {x: 0, y: 0, k: 1.6};
    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);
    // then
    expect(calculatedPoint_1.x).toEqual(0);
    expect(calculatedPoint_1.y).toEqual(0);
    expect(calculatedPoint_2.x).toEqual(6.25);
    expect(calculatedPoint_2.y).toEqual(6.25);

  });

  it('should return transformation with proper values for x transformation only ', () => {
    // given
    const transformation = {x: 55, y: 0, k: 1};
    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);
    // then
    expect(calculatedPoint_1.x).toEqual(-55);
    expect(calculatedPoint_1.y).toEqual(0);
    expect(calculatedPoint_2.x).toEqual(-45);
    expect(calculatedPoint_2.y).toEqual(10);

  });

  it('should return transformation with proper values for y transformation only ', () => {
    // given
    const transformation = {x: 0, y: 55, k: 1};
    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);
    // then
    expect(calculatedPoint_1.x).toEqual(0);
    expect(calculatedPoint_1.y).toEqual(-55);
    expect(calculatedPoint_2.x).toEqual(10);
    expect(calculatedPoint_2.y).toEqual(-45);

  });

  it('should return transformation with proper values for all parameters (x, y and zoom) being transformed ', () => {
    // given
    const transformation = {x: 100, y: 100, k: 2};
    // when
    MapViewerService.publishTransformation(transformation);
    const calculatedPoint_1 = zoomService.calculateTransition(p1);
    const calculatedPoint_2 = zoomService.calculateTransition(p2);
    // then
    expect(calculatedPoint_1.x).toEqual(-50);
    expect(calculatedPoint_1.y).toEqual(-50);
    expect(calculatedPoint_2.x).toEqual(-45);
    expect(calculatedPoint_2.y).toEqual(-45)

  });

});
