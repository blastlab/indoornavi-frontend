import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {AreaDetailsService} from './area-details.service';
import {Area, AreaBag, AreaConfiguration, Mode} from '../area.type';
import {Tag} from '../../../../../device/tag.type';
import {DeviceService} from '../../../../../device/device.service';
import {Floor} from '../../../../../floor/floor.type';
import * as d3 from 'd3';
import {Helper} from '../../../../../shared/utils/helper/helper';
import {Editable} from '../../../../../shared/wrappers/editable/editable';
import {Point} from '../../../../map.type';
import {AreaComponent} from '../area';
import {MessageServiceWrapper} from '../../../../../utils/message.service';

@Component({
  selector: 'app-area-details',
  templateUrl: './area-details.html',
  styleUrls: ['./area-details.css']
})
export class AreaDetailsComponent implements OnInit {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;

  @Input() floor: Floor;
  area: Area;
  areaConfigurationOnEnter: AreaConfiguration = new AreaConfiguration(Mode.ON_ENTER);
  areaConfigurationOnLeave: AreaConfiguration = new AreaConfiguration(Mode.ON_LEAVE);
  tags: Tag[] = [];

  private editable: Editable;
  private shift: Point;

  constructor(private areaDetailsService: AreaDetailsService,
              private tagService: DeviceService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit(): void {
    this.tagService.setUrl('tags/');
    this.area = new Area(this.floor.id);
    this.tagService.getAll().subscribe((tags: Tag[]) => {
      this.tags = tags;
    });
    this.areaDetailsService.onVisibilityChange().subscribe((value: boolean) => {
      if (value) {
        this.toolDetails.show();
      }
    });
    this.areaDetailsService.onSet().subscribe((area: AreaBag) => {
      this.area = Helper.deepCopy(area.dto);
      this.editable = area.editable;
      this.area.configurations.forEach((areaConfiguration: AreaConfiguration) => {
        if (areaConfiguration.mode.toString() === Mode[Mode.ON_LEAVE] || areaConfiguration.mode === Mode.ON_LEAVE) {
          this.areaConfigurationOnLeave = areaConfiguration;
        } else {
          this.areaConfigurationOnEnter = areaConfiguration;
        }
      });
    });
  }

  confirm(isValid: boolean): void {
    if (isValid) {
      this.area.points.length = 0;

      const selector = `${!!this.editable ? '#' + this.editable.groupWrapper.getGroup().attr('id') : '#' + AreaComponent.NEW_AREA_ID}`;
      const svgGroup = d3.select(selector);
      const pointsSelection: d3.selection = svgGroup.selectAll('circle');

      // we need to add shift since coordinates of points are within svg group and when user moves svg group we need to shift coordinates
      this.shift = (<Point>{x: +svgGroup.attr('x'), y: +svgGroup.attr('y')});

      let firstPoint: d3.selection;
      pointsSelection.each((_, i, nodes) => {
        const point: d3.selection = d3.select(nodes[i]);
        if (i === 0) {
          firstPoint = point;
        }
        this.addPoint(point);
      });
      if (firstPoint) {
        this.addPoint(firstPoint); // we need to add first point as last because of Spatial Geometry (mysql)
      }

      // change to centimeters
      this.areaConfigurationOnEnter.offset *= 100;
      this.areaConfigurationOnLeave.offset *= 100;

      if (!this.editable) {
        this.area.configurations.push(
          this.areaConfigurationOnEnter
        );
        this.area.configurations.push(
          this.areaConfigurationOnLeave
        );
      }

      this.areaDetailsService.accept(<AreaBag>{dto: this.area, editable: this.editable});
      this.toolDetails.hide();
      this.cleanUp();
    } else {
      this.messageService.failed('area.form.invalid');
    }
  }

  reject(): void {
    this.cleanUp();
    this.toolDetails.hide();
    this.areaDetailsService.reject();
  }

  private addPoint(point: d3.selection) {
    this.area.points.push(
      {
        x: parseInt(point.attr('cx'), 10) + this.shift.x,
        y: parseInt(point.attr('cy'), 10) + this.shift.y
      }
    );
  }

  private cleanUp() {
    this.areaConfigurationOnEnter = new AreaConfiguration(Mode.ON_ENTER);
    this.areaConfigurationOnLeave = new AreaConfiguration(Mode.ON_LEAVE);
    this.area = new Area(this.floor.id);
    this.editable = null;
  }
}
