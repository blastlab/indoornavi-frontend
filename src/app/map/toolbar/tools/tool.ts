import {ToolsEnum} from './tools.enum';
import {EventEmitter} from '@angular/core';

export interface Tool {
  toolEnum: ToolsEnum;
  hintMessage: String;
  active: boolean;
  clicked: EventEmitter<Tool>;
  setActive(): void;
  setInactive(): void;
}
