import {Component, Input, OnChanges} from '@angular/core';
import {ToolsEnum} from '../toolbar/tools/tools.enum';
import {Point} from '../map.type';
import {Tool} from '../toolbar/tools/tool';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-hint-bar',
  templateUrl: './hint-bar.html',
  styleUrls: ['./hint-bar.css']
})
export class HintBarComponent implements OnChanges {
  @Input() tool: Tool;
  public toolMsg: String;
  public toolName: String;
  public hintMsg: String;
  public mousePos: Point = {x: 0, y: 0};

  constructor(private translate: TranslateService) {
  }

  ngOnChanges(): void {
    this.toolName = (this.tool) ? ToolsEnum[this.tool.toolEnum] : ToolsEnum[ToolsEnum.NONE];
    this.hintMsg = (this.tool) ? this.tool.hintMessage : this.translate.instant('choose.a.tool');
  }
}
