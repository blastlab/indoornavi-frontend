import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {AreaDetailsService} from './area-details.service';
import {Area, AreaBag, AreaConfiguration, Mode} from '../area.type';
import {DeviceService} from '../../../../../device/device.service';
import {Floor} from '../../../../../floor/floor.type';
import * as d3 from 'd3';
import {Helper} from '../../../../../shared/utils/helper/helper';
import {Editable} from '../../../../../shared/wrappers/editable/editable';
import {Point} from '../../../../map.type';
import {AreaComponent} from '../area';
import {MessageServiceWrapper} from '../../../../../shared/services/message/message.service';
import {Tag} from '../../../../../device/device.type';
import {NgForm} from '@angular/forms';
import {SelectItem} from 'primeng/primeng';
import {Subject} from 'rxjs/Subject';
import {TranslateService} from '@ngx-translate/core';
import {KeyboardDefaultListener} from '../../../shared/tool-input/keyboard-default-listener';

@Component({
  selector: 'app-area-details',
  templateUrl: './area-details.html',
  styleUrls: ['./area-details.css']
})
export class AreaDetailsComponent extends KeyboardDefaultListener implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  @ViewChild('areaDetailsForm') private areaDetailsForm: NgForm;

  @Input() floor: Floor;
  area: Area;
  active: boolean = false;
  tags: Tag[] = [];
  tagsOnEnter: number[] = [];
  tagsOnLeave: number[] = [];
  tagsSelect: SelectItem[] = [];
  onEnterLabel: string;
  onLeaveLabel: string;
  areaConfigurationOnEnter: AreaConfiguration = new AreaConfiguration(Mode.ON_ENTER, 0);
  areaConfigurationOnLeave: AreaConfiguration = new AreaConfiguration(Mode.ON_LEAVE, 0);

  private editable: Editable;
  private shift: Point;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();

  constructor(private areaDetailsService: AreaDetailsService,
              private tagService: DeviceService,
              private messageService: MessageServiceWrapper,
              private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.tagService.setUrl('tags/');
    this.area = new Area(this.floor.id);
    this.tagService.getAll().takeUntil(this.subscriptionDestroyer).subscribe((tags: Tag[]): void => {
      tags.forEach((tag: Tag): void => {
        this.tags.push(tag);
        const selectTag: SelectItem = {
          value: tag.shortId,
          label: `${tag.shortId}`
        };
        this.tagsSelect.push(selectTag);
      });
    });
    this.areaDetailsService.onVisibilityChange().takeUntil(this.subscriptionDestroyer).subscribe((value: boolean): void => {
      if (value) {
        this.toolDetails.show();
        this.active = true;
      }
    });
    this.areaDetailsService.onSet().subscribe((area: AreaBag): void => {
      this.area = Helper.deepCopy(area.dto);
      this.editable = area.editable;
      this.area.configurations.forEach((areaConfiguration: AreaConfiguration): void => {
        if (areaConfiguration.mode.toString() === Mode[Mode.ON_LEAVE] || areaConfiguration.mode === Mode.ON_LEAVE) {
          this.areaConfigurationOnLeave = areaConfiguration;
          this.areaConfigurationOnLeave.offset /= 100;
          this.tagsOnLeave = areaConfiguration.tags.map((tag: Tag) => {
            return tag.shortId;
          });
        } else {
          this.areaConfigurationOnEnter = areaConfiguration;
          this.areaConfigurationOnEnter.offset /= 100;
          this.tagsOnEnter = areaConfiguration.tags.map((tag: Tag) => {
            return tag.shortId;
          });
        }
      });
    });
    this.areaDetailsService.onDecisionRejected().takeUntil(this.subscriptionDestroyer).subscribe(() => {
      this.cleanUp();
      this.toolDetails.hide();
    });
    this.setTranslations();
    this.areaDetailsService.onRemove().takeUntil(this.subscriptionDestroyer).subscribe((): void => {
      this.cleanUp();
      this.toolDetails.hide();
    });
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  confirm() {
    this.confirmWithForm(this.areaDetailsForm.valid);
  }

  confirmWithForm(formIsValid: boolean): void {
    if (formIsValid) {
      if (this.isHeightValid()) {
        this.area.pointsInPixels.length = 0;
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
        this.areaConfigurationOnEnter.offset *= 100;
        this.areaConfigurationOnLeave.offset *= 100;
        this.areaConfigurationOnEnter.tags = [];
        this.areaConfigurationOnLeave.tags = [];
        this.tagsOnEnter.forEach((tagId: number): void => {
          const foundTag: Tag = this.tags.find((tag: Tag): boolean => {
            return tag.shortId === tagId;
          });
          if (!!foundTag) {
            this.areaConfigurationOnEnter.tags.push(foundTag);
          }
        });
        this.tagsOnLeave.forEach((tagId: number): void => {
          const foundTag: Tag = this.tags.find((tag: Tag): boolean => {
            return tag.shortId === tagId;
          });
          if (!!foundTag) {
            this.areaConfigurationOnLeave.tags.push(foundTag);
          }
        });

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
        this.messageService.failed('area.height.invalid');
      }
    } else {
      this.messageService.failed('area.form.invalid');
    }
    this.active = false;
  }

  reject(): void {
    this.cleanUp();
    this.areaDetailsService.reject();
    this.active = false;
  }

  private isHeightValid(): boolean {
    let heightIsValid = true;
    const isAreaHeightMaxSet = !(this.area.heightMax === null || this.area.heightMax === undefined) && this.area.heightMax > 0;
    const isAreaHeightMinSet = !(this.area.heightMin === null || this.area.heightMin === undefined) && this.area.heightMin >= 0;

    if (!isAreaHeightMinSet && isAreaHeightMaxSet) { // someone has set max but forget about min
      this.area.heightMin = 0;
    } else if (!isAreaHeightMaxSet || !isAreaHeightMinSet) { // check if height values are set, if not then set null
      this.area.heightMax = isAreaHeightMaxSet ? this.area.heightMax : null;
      this.area.heightMin = isAreaHeightMinSet ? this.area.heightMin : null;
    } else {
      heightIsValid = (this.area.heightMin < this.area.heightMax && this.area.heightMin >= 0 && this.area.heightMax >= 1);
    }
    return heightIsValid;
  }

  private addPoint(point: d3.selection): void {
    this.area.pointsInPixels.push(
      {
        x: parseInt(point.attr('cx'), 10) + this.shift.x,
        y: parseInt(point.attr('cy'), 10) + this.shift.y
      }
    );
  }

  private cleanUp(): void {
    Object.keys(this.areaDetailsForm.controls).forEach((fieldName: string) => {
      if (fieldName === 'on_enter' || fieldName === 'on_leave') {
        this.areaDetailsForm.controls[fieldName].reset();
      }
    });
    this.areaConfigurationOnEnter = new AreaConfiguration(Mode.ON_ENTER, 0);
    this.areaConfigurationOnLeave = new AreaConfiguration(Mode.ON_LEAVE, 0);
    this.area = new Area(this.floor.id);
    this.editable = null;
  }

  private setTranslations() {
    this.translateService.setDefaultLang('en');
    this.translateService.get('area.on_enter.select').subscribe((value: string) => {
      this.onEnterLabel = value;
    });
    this.translateService.get('area.on_leave.select').subscribe((value: string) => {
      this.onLeaveLabel = value;
    });
  }
}
