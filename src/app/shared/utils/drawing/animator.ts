import * as d3 from 'd3';

export class SvgAnimator {

  static startBlinking(selectable: d3.selection): void {
    selectable.elements.forEach((element: d3.selection): void => {
      const selection: d3.selection = element[0];
      const fill: string = selection.style('fill');
      const stroke: string = selection.style('stroke');
      let counter = 0;
      const blinker = () => setTimeout((): void => {
        selection.style('fill') === fill ? selection.style('fill', 'red') : selection.style('fill', fill);
        selection.style('stroke') === stroke ? selection.style('stroke', 'red') : selection.style('stroke', stroke);
        counter++;
        if (counter < 10) {
          blinker();
        }
      }, 100);
      blinker();
    });
  }

  constructor() {}
}
