import {ToolName} from './tools.enum';
import {EventEmitter} from '@angular/core';

export interface Tool {
  hintMessage: string;
  active: boolean;
  clicked: EventEmitter<Tool>;
  getToolName(): ToolName;
  setActive(): void;
  setInactive(): void;
}
