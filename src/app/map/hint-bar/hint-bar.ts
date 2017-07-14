import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ToolName} from '../toolbar/tools/tools.enum';
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
  public toolName: String;
  public hintMsg: String;
  public mousePos: Point = {x: 0, y: 0};

  constructor(private translate: TranslateService,
              private _hintBar: HintBarService) {
  }

  ngOnInit(): void {
    this.setTranslations();
    this.translate.get('choose.a.tool').subscribe((value: string) => {
      this.setHint(value);
    });
  }

  ngOnChanges(): void {
    this.toolName = (this.tool) ? ToolName[this.tool.toolEnum] : ToolName[ToolName.NONE];
    this._hintBar.hint$.subscribe((message: string) => {
      this.setHint(message);
    });
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
  }

  public setHint(defaultMsg: string) {
    this.hintMsg = defaultMsg;
  }

}
