import {ToolName} from './tools.enum';

export interface Tool {
  active: boolean;

  getHintMessage(): string;
  getToolName(): ToolName;
  setActive(): void;
  setInactive(): void;
  setDisabled(value: boolean): void;
}
