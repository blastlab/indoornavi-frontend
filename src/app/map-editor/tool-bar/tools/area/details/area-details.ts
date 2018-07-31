import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {AreaDetailsService} from './area-details.service';
import {Area, AreaBag, AreaConfiguration, AreaConfigurationDto, Mode} from '../areas.type';
import {DeviceService} from '../../../../../device/device.service';
import {Floor} from '../../../../../floor/floor.type';
import * as d3 from 'd3';
import {Helper} from '../../../../../shared/utils/helper/helper';
import {Editable} from '../../../../../shared/wrappers/editable/editable';
import {Point} from '../../../../map.type';
import {AreasComponent} from '../areas';
import {MessageServiceWrapper} from '../../../../../shared/services/message/message.service';
import {Tag} from '../../../../../device/device.type';
import {MultiSelect, SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-area-details',
  templateUrl: './area-details.html',
  styleUrls: ['./area-details.css']
})
export class AreaDetailsComponent implements OnInit {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  @ViewChild('multiSelectOnEnter') private multiSelectOnEnter: MultiSelect;
  @ViewChild('multiSelectOnLeave') private multiSelectOnLeave: MultiSelect;

  @Input() floor: Floor;
  area: Area;
  areaConfigurationOnEnter: SelectItem[] = [];
  areaConfigurationOnLeave: SelectItem[] = [];
  tags: Tag[] = [];

  private editable: Editable;
  private shift: Point;

  // static transformToMultiSelectTagsConfigurationFormat(tags: Tag[]): Tag[] {
  //   const transformedTags = [];
  //   tags.forEach((tag: Tag): void => {
  //     const selectTag: SelectItem = {
  //       value: tag.shortId,
  //       label: `${tag.shortId}`
  //     };
  //     transformedTags.push(selectTag);
  //   });
  //   return transformedTags;
  // }
  // static transformToAreaDtoFormat(configObject: AreaConfiguration): AreaConfigurationDto {
  //   const areaConfigurationDto: AreaConfigurationDto = new AreaConfigurationDto();
  //   Object.keys(configObject).forEach((key: any): void => {
  //     if (key === 'tags') {
  //       areaConfigurationDto[key] = [];
  //       configObject[key].forEach((tag: SelectTag): void => {
  //         const tagDto: Tag = <Tag>tag;
  //         delete tagDto['shortIdSelect'];
  //         areaConfigurationDto[key].push(tagDto);
  //       });
  //     } else {
  //       areaConfigurationDto[key] = configObject[key]
  //     }
  //   });
  //   return areaConfigurationDto;
  // }


  constructor(private areaDetailsService: AreaDetailsService,
              private tagService: DeviceService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit(): void {
    this.tagService.setUrl('tags/');
    this.area = new Area(this.floor.id);
    this.tagService.getAll().subscribe((tags: Tag[]): void => {
      tags.forEach((tag: Tag): void => {
        this.tags.push(tag);
      });
    });
    this.areaDetailsService.onVisibilityChange().subscribe((value: boolean): void => {
      if (value) {
        this.toolDetails.show();
      }
    });
    this.areaDetailsService.onSet().subscribe((area: AreaBag): void => {
      this.area = Helper.deepCopy(area.dto);
      this.editable = area.editable;
      this.area.configurations.forEach((areaConfiguration: AreaConfiguration) => {
        if (areaConfiguration.mode.toString() === Mode[Mode.ON_LEAVE] || areaConfiguration.mode === Mode.ON_LEAVE) {
          this.areaConfigurationOnLeave = areaConfiguration;
          this.areaConfigurationOnLeave.offset /= 100;
        } else {
          this.areaConfigurationOnEnter = areaConfiguration;
          this.areaConfigurationOnEnter.offset /= 100;
        }
      });
    });
    this.areaDetailsService.onDecisionMade().subscribe((area: AreaBag) => {
      if (!area) { // rejected
        this.toolDetails.hide();
      }
    });
    this.multiSelectOnEnter.resetFilterOnHide = true;
  }

  confirm(formIsValid: boolean): void {
    if (formIsValid) {
      let heightIsValid = true;
      if (!this.area.heightMax || !this.area.heightMin) { // check if height values are set, if not or deleted than send null
        this.area.heightMax = null;
        this.area.heightMin = null;
      } else {
        heightIsValid = (this.area.heightMin < this.area.heightMax && this.area.heightMin  >= 0 && this.area.heightMax >= 1);
      }
      if (heightIsValid) {
        this.area.points.length = 0;
        const selector = `${!!this.editable ? '#' + this.editable.groupWrapper.getGroup().attr('id') : '#' + AreasComponent.NEW_AREA_ID}`;
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
        this.areaConfigurationOnEnter.offset *= 100;
        this.areaConfigurationOnLeave.offset *= 100;

        const areaConfigurationOnEnterDto: AreaConfigurationDto = AreaDetailsComponent.transformToAreaDtoFormat(this.areaConfigurationOnEnter);
        const areaConfigurationOnLeaveDto: AreaConfigurationDto = AreaDetailsComponent.transformToAreaDtoFormat(this.areaConfigurationOnLeave);
        if (!this.editable) {
          this.area.configurations.push(
            areaConfigurationOnEnterDto
          );
          this.area.configurations.push(
            areaConfigurationOnLeaveDto
          );
        }
        this.areaDetailsService.accept(<AreaBag>{dto: this.area, editable: this.editable});
        this.toolDetails.hide();
        this.cleanUp();
      } else {
        this.messageService.failed('area.height.invalid');
      }
    } else {
      this.messageService.failed('area.form.invalid');
    }
  }

  reject(): void {
    this.cleanUp();
    this.areaDetailsService.reject();
  }

  private addPoint(point: d3.selection): void {
    this.area.points.push(
      {
        x: parseInt(point.attr('cx'), 10) + this.shift.x,
        y: parseInt(point.attr('cy'), 10) + this.shift.y
      }
    );
  }

  private cleanUp(): void {
    this.areaConfigurationOnEnter = new AreaConfiguration(Mode.ON_ENTER, 0);
    this.areaConfigurationOnLeave = new AreaConfiguration(Mode.ON_LEAVE, 0);
    this.area = new Area(this.floor.id);
    this.editable = null;
  }

}
