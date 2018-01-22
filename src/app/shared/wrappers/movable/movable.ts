import {SvgGroupWrapper} from '../../utils/drawing/drawing.builder';
import {Point} from '../../../map-editor/map.type';

export class Movable extends SvgGroupWrapper {
  static TRANSITION_DURATION: number = 1000;
  transitionEnded: boolean = true;
  shortId: number;

  setShortId(id: number) {
    this.shortId = id;
    return this;
  }

  move(destination: Point): Promise<number> {
    return new Promise((resolve) => {
      this.getGroup()
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
}
