import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Tool} from './tools/tool';
import {ToolbarService} from './toolbar.service';
import {Subscription} from 'rxjs/Subscription';
import {Floor} from '../../floor/floor.type';
import {Configuration} from '../action-bar/actionbar.type';
import {ActionBarService} from '../action-bar/actionbar.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Input() floor: Floor;
  @ViewChildren('tool') tools: QueryList<Tool>;

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
        this.toggleDisable(false);
      }
    });
    this. configurationChanged = this.actionBarService.configurationChanged().subscribe(() => {
      this.scaleSet = true;
    });
    this.toolChangedSubscription = this.toolbarService.onToolChanged().subscribe((tool: Tool) => {
      const activate: boolean = (tool && this.activeTool !== tool);
      if (!!this.activeTool) {
        this.activeTool.setInactive();
        this.activeTool = undefined;
        this.toggleDisable(false);
      }
      if (activate) {
        tool.setActive();
        this.activeTool = tool;
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
    if(!!this.configurationLoaded) {
      this.configurationLoaded.unsubscribe();
    }
  }


  private toggleDisable(value: boolean): void {
    if (this.scaleSet) {
      this.tools.forEach((item: Tool) => {
        item.setDisabled(value);
      });
    }
  }
}
