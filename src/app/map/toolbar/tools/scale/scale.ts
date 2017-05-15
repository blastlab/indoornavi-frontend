import {Component, EventEmitter, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
// import {Scale} from './scale.type';

@Component({
  selector: 'app-scale',
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class ScaleComponent implements Tool {
  @Output() clickedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String = 'Click at map to set scale.';
  // private scale: Scale;  // use for scale data
  public active: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.SCALE; // used in hint-bar component as a toolName

  constructor(private translate: TranslateService) {
  }

  public toolClicked(): void {
    this.setTranslations();
    this.clickedTool.emit(this);
  }

  public setActive(): void {
    this.active = true;
    this.startDrawingScale();
  }

  public setInactive(): void {
    this.hideScale();
    this.active = false;
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('click.at.map.to.set.scale').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private startDrawingScale(): void {
    const map = d3.select('#map');
    map.style('cursor', 'crosshair');
    map.on('click', function () {
      map.append('svg:circle')
        .attr('id', 'scale')
        .attr('cx', d3.event.offsetX)
        .attr('cy', d3.event.offsetY)
        .attr('r', '5px');
    });
  }

  private hideScale(): void {
    d3.select('#map').style('cursor', 'default');
    d3.select('#map').select('#scale').remove();
  }
}
