import {ToolName} from './tools.enum';
import {EventEmitter} from '@angular/core';

export interface Tool {
  toolName: ToolName;
  hintMessage: String;
  active: boolean;
  clicked: EventEmitter<Tool>;
  setActive(): void;
  setInactive(): void;
}
