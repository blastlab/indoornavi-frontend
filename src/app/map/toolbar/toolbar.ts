import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToolsEnum} from './tools/tools.enum';
import {Tool} from './tools/tool';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent implements OnInit {
  @Output() selectedTool: EventEmitter<ToolsEnum> = new EventEmitter<ToolsEnum>();
  activeTool: Tool;
  constructor() { }

  ngOnInit() {
  }
  public setTool(eventTool: Tool): void {
    if (!!this.activeTool) {
      // eventTool.setInactive();
      // this.activeTool = null;
      if (this.activeTool === eventTool) {
      } else {
      }
    } else {
      // eventTool.setActive();
      // this.activeTool = eventTool;
    }
  }
}
