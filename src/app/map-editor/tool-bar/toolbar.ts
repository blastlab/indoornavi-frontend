import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Tool} from './tools/tool';
import {ToolbarService} from './toolbar.service';
import {Subscription} from 'rxjs/Subscription';
import {Floor} from '../../floor/floor.type';
import {Configuration} from '../action-bar/actionbar.type';
import {ActionBarService} from '../action-bar/actionbar.service';
import {ToolName} from './tools/tools.enum';
import {merge} from 'rxjs/observable/merge';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html'
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Input() floor: Floor;
  @ViewChildren('toolScaleDependent') scaleDependentTools: QueryList<Tool>;
  @ViewChildren('toolWizardDependent') wizardDependentTools: QueryList<Tool>;

  private activeTool: Tool;
  private toolChangedSubscription: Subscription;
  private configurationLoaded: Subscription;
  private configurationChanged: Subscription;
  private scaleSet: boolean = false;

  constructor(private toolbarService: ToolbarService, private actionBarService: ActionBarService) {
  }

  ngOnInit(): void {
    this.configurationLoaded = this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration) => {
      if (!!configuration.data.scale) {
        this.scaleSet = true;
        this.toggleScaleDependentToolsDisable(false);
      }
    });
    this.configurationChanged = merge(this.actionBarService.configurationChanged(), this.actionBarService.configurationReset()).subscribe((configuration: Configuration) => {
      if (!!configuration.data.scale) {
        this.scaleSet = true;
        this.toggleScaleDependentToolsDisable(false);
      } else {
        this.scaleSet = false;
        this.toggleScaleDependentToolsDisable(true);
      }
    });
    this.toolChangedSubscription = this.toolbarService.onToolChanged().subscribe((tool: Tool) => {
      const activate: boolean = (tool && this.activeTool !== tool);
      if (!!this.activeTool) {
        this.activeTool.setInactive();
        this.activeTool = undefined;
      }
      if (activate) {
        tool.setActive();
        this.activeTool = tool;
        if (this.activeTool.getToolName() === ToolName.WIZARD) {
          this.toggleWizardDependentToolsDisable(true);
        }
      } else if (this.scaleSet) {
        this.toggleWizardDependentToolsDisable(false);
      }
    });
  }

  ngOnDestroy() {
    if (!!this.toolChangedSubscription) {
      this.toolChangedSubscription.unsubscribe();
    }
    if (!!this.configurationChanged) {
      this.configurationChanged.unsubscribe();
    }
  }

  private toggleScaleDependentToolsDisable(value: boolean): void {
    this.scaleDependentTools.forEach((item: Tool) => {
      item.setDisabled(value);
    });
  }

  private toggleWizardDependentToolsDisable(value: boolean): void {
    this.wizardDependentTools.forEach((item: Tool) => {
      item.setDisabled(value);
    });
  }
}
