import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ScaleInputService} from './input.service';
import {Measure, Scale} from '../scale.type';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {MessageServiceWrapper} from '../../../../../shared/services/message/message.service';
import {SelectItem} from 'primeng/primeng';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';

@Component({
  selector: 'app-scale-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css']
})
export class ScaleInputComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails')
  toolDetails: ToolDetailsComponent;
  scale: Scale;
  visible: boolean = false;
  measures: SelectItem[] = [];

  private scaleChangedSubscription: Subscription;
  private scaleVisibilityChangedSubscription: Subscription;

  constructor(private messageService: MessageServiceWrapper,
              private scaleService: ScaleService,
              private scaleInputService: ScaleInputService) {
  }

  ngOnInit() {
    const objValues = Object.keys(Measure).map(k => Measure[k]);
    this.measures = objValues.filter(v => typeof v === 'string').map((value: string, index: number) => {
      return {
        label: value,
        value: value
      }
    });

    this.scaleVisibilityChangedSubscription = this.scaleService.scaleVisibilityChanged.subscribe((isScaleVisible: boolean) => {
      isScaleVisible ? this.toolDetails.show() : this.toolDetails.hide();
    });

    this.scaleChangedSubscription = this.scaleService.scaleChanged.subscribe(scale => {
      this.scale = scale;
      if (!this.scale.measure) {
        // @ts-ignore
        this.scale.measure = Measure[Measure.CENTIMETERS];
      }
    });
  }

  ngOnDestroy() {
    if (!!this.scaleChangedSubscription) {
      this.scaleChangedSubscription.unsubscribe();
    }
    if (!!this.scaleVisibilityChangedSubscription) {
      this.scaleVisibilityChangedSubscription.unsubscribe();
    }
  }

  confirm() {
    if (!this.scale.realDistance && !Number.isInteger(this.scale.realDistance)) {
      this.messageService.failed('scale.mustBeInteger');
      return;
    } else if (!this.scale.measure) {
      this.messageService.failed('scale.measureNotSet');
    } else {
      this.scaleInputService.publishSaveClicked(this.scale);
      this.messageService.success('scale.setSuccess');
    }
  }

  reject() {
    this.messageService.success('scale.changesRejected');
    this.scaleInputService.publishSaveClicked(null);
    this.scaleInputService.publishChangesRejected();
  }

  emitScaleHide() {
    this.scaleInputService.publishVisibilityChange(false);
  }
}
