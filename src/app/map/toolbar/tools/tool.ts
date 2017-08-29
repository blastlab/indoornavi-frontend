import {ToolName} from './tools.enum';
import {EventEmitter} from '@angular/core';

export interface Tool {
  hintMessage: String;
  active: boolean;
  clicked: EventEmitter<Tool>;
  getToolName(): ToolName;
  setActive(): void;
  setInactive(): void;
}
