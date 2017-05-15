import {Component, EventEmitter, Output} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import * as d3 from 'd3';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html',
  styleUrls: ['../tool.css']
})
export class WizardComponent implements Tool {
  @Output() clickedWizard: EventEmitter<Tool> = new EventEmitter<Tool>();
  public hintMessage: String;
  public active: boolean = false;
  public toolEnum: ToolsEnum = ToolsEnum.WIZARD; // used in hint-bar component as a toolName

  constructor(private translate: TranslateService) {
  }

  public toolClicked(): void {
    this.setTranslations();
    this.clickedWizard.emit(this);
  }

  public setActive(): void {
    // connect to webSocket
    this.active = true;
  }

  public setInactive(): void {
    // save or break connection
    this.active = false;
  }

  private setTranslations() {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }
}
