import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Tool} from './tools/tool';
import {Floor} from '../../floor/floor.type';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent implements OnDestroy {
  @Output() selectedTool: EventEmitter<Tool> = new EventEmitter<Tool>();
  @Output() hint: EventEmitter<string> = new EventEmitter<string>();

  @Input() floor: Floor;
  activeTool: Tool;

  constructor() {
  }

  ngOnDestroy() {
    if (this.selectedTool) {
      this.selectedTool.unsubscribe();
    }
    if (this.hint) {
      this.hint.unsubscribe();
    }
  }

  public setTool(eventTool: Tool): void {
    const activate: boolean = (this.activeTool !== eventTool);
    if (!!this.activeTool) {
      this.activeTool.setInactive();
      this.activeTool = undefined;
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
