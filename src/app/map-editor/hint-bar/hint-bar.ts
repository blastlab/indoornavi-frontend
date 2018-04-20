import {Component, OnInit} from '@angular/core';
import {ToolName} from '../tool-bar/tools/tools.enum';
import {Tool} from '../tool-bar/tools/tool';
import {TranslateService} from '@ngx-translate/core';
import {ToolbarService} from '../tool-bar/toolbar.service';
import {HintBarService} from './hintbar.service';

@Component({
  selector: 'app-hint-bar',
  templateUrl: './hint-bar.html',
  styleUrls: ['./hint-bar.css']
})
export class HintBarComponent implements OnInit {
  public toolName: string = ToolName[ToolName.NONE];
  public hintMessage: string;
  private defaultHintMessage: string;

  constructor(private translate: TranslateService,
              private toolbarService: ToolbarService,
              private hintBarService: HintBarService) {
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('hint.chooseTool').subscribe((value: string) => {
      this.defaultHintMessage = value;
      this.hintMessage = this.defaultHintMessage;
    });
    this.toolbarService.onToolChanged().subscribe((tool: Tool) => {
      if (!!tool) {
        this.toolName = ToolName[tool.getToolName()];
        this.translate.get(tool.getHintMessage()).subscribe((translated: string) => {
          this.hintMessage = translated;
        });
      } else {
        this.toolName = ToolName[ToolName.NONE];
        this.hintMessage = this.defaultHintMessage;
      }
    });
    this.hintBarService.onHintMessageReceived().subscribe((key: string) => {
      this.translate.get(key).subscribe((translated: string) => {
        this.hintMessage = translated;
        console.log(translated);
      });
    });
  }
}
