import {Point} from '../../../map-editor/map.type';
import {SvgGroupWrapper} from '../../utils/drawing/drawing.builder';

export class Movable {
  static TRANSITION_DURATION: number = 1000;
  transitionEnded: boolean = true;
  shortId: number;

  constructor(private svgGroupWrapper: SvgGroupWrapper) {

  }

  setShortId(id: number) {
    this.shortId = id;
    return this;
  }

  move(destination: Point): Promise<number> {
    return new Promise((resolve) => {
      this.svgGroupWrapper.getGroup()
        .transition()
        .attr('x', destination.x)
        .attr('y', destination.y)
        .on('start', () => {
          this.transitionEnded = false;
        })
        .on('end', () => {
          this.transitionEnded = true;
          resolve(this.shortId);
        }).duration(Movable.TRANSITION_DURATION);
    });
  }

  remove() {
    this.svgGroupWrapper.remove();
  }
}
