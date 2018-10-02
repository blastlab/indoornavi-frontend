import * as d3 from 'd3';

export class SvgAnimator {

  static startBlinking(element: d3.selection): void {
    const fill: string = element.style('fill');
    const stroke: string = element.style('stroke');
    let counter = 0;
    const blinker = () => setTimeout((): void => {
      element.style('fill') === fill ? element.style('fill', 'red') : element.style('fill', fill);
      element.style('stroke') === stroke ? element.style('stroke', 'red') : element.style('stroke', stroke);
      counter++;
      if (counter < 10) {
        blinker();
      }
    }, 100);
    blinker();
  }

  constructor() {}
}
