import {ToolsEnum} from './tools.enum';
export interface Tool {
  toolEnum: ToolsEnum;
  hintMessage: String;
  active: boolean;
  setActive(): void;
  setInactive(): void;
}
