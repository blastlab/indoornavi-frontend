import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Tool} from './tools/tool';
import {ToolbarService} from './toolbar.service';
import {Subscription} from 'rxjs/Subscription';
import {Floor} from '../../floor/floor.type';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Input() floor: Floor;

  private activeTool: Tool;
  private toolChangedSubscription: Subscription;

  constructor(private toolbarService: ToolbarService) {
  }

  ngOnInit(): void {
    this.toolChangedSubscription = this.toolbarService.onToolChanged().subscribe((tool: Tool) => {
      const activate: boolean = (tool && this.activeTool !== tool);
      if (!!this.activeTool) {
        this.activeTool.setInactive();
        this.activeTool = undefined;
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
  }
}
