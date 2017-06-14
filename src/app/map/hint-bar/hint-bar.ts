import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ToolsEnum} from '../toolbar/tools/tools.enum';
import {Point} from '../map.type';
import {Tool} from '../toolbar/tools/tool';
import {TranslateService} from '@ngx-translate/core';
import {HintBarService} from './hint-bar.service';

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

  constructor(private translate: TranslateService,
              private _hintBar: HintBarService) {
  }

  ngOnInit(): void {
    this.setTranslations();
    this._hintBar.hint$.subscribe((message: string) => {
      this.hintMsg = (message) ? message : this.toolMsg;
    });
  }

  ngOnChanges(): void {
    this.toolName = (this.tool) ? ToolsEnum[this.tool.toolEnum] : ToolsEnum[ToolsEnum.NONE];
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('choose.a.tool').subscribe((value: string) => {
      this.toolMsg = value;
    });
  }

}
