import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ToolsEnum} from '../toolbar/tools/tools.enum';
import {Point} from '../map.type';
import {Tool} from '../toolbar/tools/tool';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-hint-bar',
  templateUrl: './hint-bar.html',
  styleUrls: ['./hint-bar.css']
})
export class HintBarComponent implements OnInit, OnChanges {
  @Input() tool: Tool;
  public toolMsg: String;
  public toolName: String;
  public hintMsg: String;
  public mousePos: Point = {x: 0, y: 0};

  constructor(private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.setTranslations();
  }

  ngOnChanges(): void {
    this.toolName = (this.tool) ? ToolsEnum[this.tool.toolEnum] : ToolsEnum[ToolsEnum.NONE];
    this.getHintMsg();
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('choose.a.tool').subscribe((value: string) => {
      this.toolMsg = value;
      this.getHintMsg();
    });
  }

  private getHintMsg() {
    this.hintMsg = (this.tool) ? this.tool.hintMessage : this.toolMsg;
  }
}
