import * as d3 from 'd3';
import {GroupCreated} from './draw.builder';

export class Selectable {
  private domGroup: d3.selection;
  public container: d3.selection;
  public groupCreated: GroupCreated;
  private selected: boolean;

  constructor(group: GroupCreated) {
    // this.groupCreated = groupCreated;
    this.domGroup = group.domGroup;
    this.domGroup.on('click', () => {
      this.selected = !this.selected;
      this.domGroup.classed('selected', this.selected);
    });
  }

  // private makeSelectable() {
  //   this.domGroup.on('click', () => {
  //     this.select();
  //   });
  // }
  //
  // public select() {
  //   console.log('select and set deselect');
  //   console.log(this);
  //   this.domGroup.on('click', () => {
  //     this.deselect();
  //   });
  //   this.domGroup.classed('selected', true);
  // }
  //
  // public deselect() {
  //   console.log('deselect');
  //   // this.makeSelectable();
  //   this.domGroup.classed('selected', false);
  // }
  //
  // private createSelectionBorder() {
  //
  // }


}
