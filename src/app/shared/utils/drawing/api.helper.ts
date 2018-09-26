import * as d3 from 'd3';

export class ApiHelper {
  static setFillColor(element: d3.selection, color: string): void {
    element.attr('fill', color);
  }

  static setStrokeColor(element: d3.selection, color: string): void {
    element.attr('stroke', color);
  }

  static setFillOpacity(element: d3.selection, opacity: number): void {
    element.attr('fill-opacity', opacity);
  }

  static setStrokeOpacity(element: d3.selection, opacity: number): void {
    element.attr('stroke-opacity', opacity);
  }

  static setStrokeWidth(element: d3.selection, width: number): void {
    element.attr('stroke-width', width);
  }

  static setDottedLine(element: d3.selection, color: string, width: number): void {
    ApiHelper.setStrokeColor(element, color);
    ApiHelper.setStrokeWidth(element, width);
    element.attr('stroke-dasharray', '0.1, 15');
    element.attr('stroke-linecap', 'round')
    element.attr('fill', 'none');
  }
}
