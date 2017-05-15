import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Tool} from './tools/tool';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent implements OnInit {
  @Output() selectedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  @Output() hint: EventEmitter<String> = new EventEmitter<String>();
  activeTool: Tool;

  constructor() {
  }

  ngOnInit() {
  }

  public setTool(eventTool: Tool): void {
    const activate: boolean = (this.activeTool !== eventTool);
    if (!!this.activeTool) {
      this.activeTool.setInactive();
      this.activeTool = null;
    }
    if (activate) {
      eventTool.setActive();
      this.activeTool = eventTool;
    }
    if (!!this.activeTool) {
      this.selectedTool.emit(eventTool);
      this.hint.emit(eventTool.hintMessage);
    } else {
      this.selectedTool.emit(null);
    }
  }
}
