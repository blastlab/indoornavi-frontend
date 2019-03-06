import {Component, EventEmitter, HostListener, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SelectItem} from 'primeng/primeng';
import {Tag} from '../../device/device.type';
import {DeviceService} from '../../device/device.service';
import {HeatmapFilterProperties} from './heatmap-filter-properties.type';

@Component({
  selector: 'app-heatmap-filter-properties',
  templateUrl: './heatmap-filter-properties.html',
  styleUrls: ['./heatmap-filter-properties.css'],
  animations: [
    trigger('toggle', [
      state('open', style({
        width: '{{width}}',
        height: '{{height}}'
      }), {params: {width: HeatmapFilterPropertiesComponent.WIDTH_ON_OPEN, height: HeatmapFilterPropertiesComponent.HEIGHT_ON_OPEN}}),
      state('close', style({
        width: '{{width}}',
        height: '{{height}}'
      }), {params: {width: HeatmapFilterPropertiesComponent.WIDTH_ON_CLOSE, height: HeatmapFilterPropertiesComponent.HEIGHT_ON_CLOSE}}),
      transition('minimized <=> maximized', animate(500))
    ])
  ]
})
export class HeatmapFilterPropertiesComponent implements OnInit {
  private static WIDTH_ON_OPEN_MOBILE: string = 'calc(100% - 30px)';
  private static WIDTH_ON_OPEN: string = '500px';
  private static WIDTH_ON_CLOSE: string = '200px';
  private static WIDTH_ON_CLOSE_MOBILE: string = 'calc(100% - 30px)';
  private static HEIGHT_ON_OPEN: string = '220px';
  private static HEIGHT_ON_OPEN_MOBILE: string = 'calc(100% - 60px)';
  private static HEIGHT_ON_CLOSE: string = '60px';

  @Output() onClose: EventEmitter<HeatmapFilterProperties> = new EventEmitter<HeatmapFilterProperties>();

  currentState: string = 'close';
  width: string = HeatmapFilterPropertiesComponent.WIDTH_ON_CLOSE;
  height: string = HeatmapFilterPropertiesComponent.HEIGHT_ON_CLOSE;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  isMobileView: boolean = false;
  tags: SelectItem[] = [];
  selectedTags: Tag[] = [];

  constructor(private tagService: DeviceService) {
    tagService.setUrl('tags/');
  }

  ngOnInit(): void {
    this.isMobileView = window.innerWidth <= 480;
    this.setDimensions();
    this.fromDate.setDate(this.fromDate.getDate() - 1);
    this.tagService.getAll().subscribe((tags: Tag[]) => {
      tags.forEach((tag: Tag) => {
        this.tags.push({
          label: tag.shortId.toString(),
          value: tag
        });
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobileView = window.innerWidth <= 480;
    this.setDimensions();
  }

  open(): void {
    if (this.currentState === 'close') {
      if (this.isMobileView) {
        this.width = HeatmapFilterPropertiesComponent.WIDTH_ON_OPEN_MOBILE;
        this.height = HeatmapFilterPropertiesComponent.HEIGHT_ON_OPEN_MOBILE;
      } else {
        this.width = HeatmapFilterPropertiesComponent.WIDTH_ON_OPEN;
        this.height = HeatmapFilterPropertiesComponent.HEIGHT_ON_OPEN;
      }
      this.currentState = 'open';
    }
  }

  close(): void {
    if (this.currentState === 'open') {
      if (this.isMobileView) {
        this.width = HeatmapFilterPropertiesComponent.WIDTH_ON_CLOSE_MOBILE;
      } else {
        this.width = HeatmapFilterPropertiesComponent.WIDTH_ON_CLOSE;
      }
      this.height = HeatmapFilterPropertiesComponent.HEIGHT_ON_CLOSE;
      this.currentState = 'close';

      this.onClose.next({
        from: this.fromDate,
        to: this.toDate,
        tags: this.selectedTags
      });
    }
  }

  private setDimensions(): void {
    if (this.isMobileView) {
      this.width = HeatmapFilterPropertiesComponent.WIDTH_ON_CLOSE_MOBILE;
    }
  }

  updateDate(date: Date, type: string) {
    if (type === 'from') {
      this.fromDate = date;
    } else {
      this.toDate = date;
    }
  }
}
