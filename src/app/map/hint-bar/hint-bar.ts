import {Component, Input, OnChanges} from '@angular/core';
import {ToolsEnum} from '../toolbar/tools/tools.enum';
import * as d3 from 'd3';

@Component({
  selector: 'app-hint-bar',
  templateUrl: './hint-bar.html',
  styleUrls: ['./hint-bar.css']
})
export class HintBarComponent implements OnChanges {
  @Input() tool: ToolsEnum;
  public toolMsg: String = 'toolMsg';
  public toolName: String;
  public hintMsg: String;

  constructor() { }

  ngOnChanges() {
    this.toolName = ToolsEnum[this.tool];
    this.hintMsg = (this.tool) ? this.toolMsg : 'Choose a tool';
  }

}
