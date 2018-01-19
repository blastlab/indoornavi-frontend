import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ScaleInputService} from './input.service';
import {Measure, Scale} from '../scale.type';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {MessageServiceWrapper} from '../../../../../utils/message.service';
import {SelectItem} from 'primeng/primeng';
import {Subscription} from 'rxjs/Subscription';
import {TranslateService} from '@ngx-translate/core';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';

@Component({
  selector: 'app-scale-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css']
})
export class ScaleInputComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails')
  toolDetails: ToolDetailsComponent;

  visible: boolean = false;
  scale: Scale;
  measures: SelectItem[] = [];
  // workaround for this: https://github.com/primefaces/primeng/issues/4485
  placeholder: string = '...';

  private scaleChangedSubscription: Subscription;
  private scaleVisibilityChangedSubscription: Subscription;

  constructor(private messageService: MessageServiceWrapper,
              private scaleService: ScaleService,
              private scaleInputService: ScaleInputService,
              private translateService: TranslateService) {
    this.scale = <Scale>{
      start: null,
      stop: null,
      realDistance: null,
      measure: null
    };
  }

  ngOnInit() {
    // workaround for this: https://github.com/primefaces/primeng/issues/4485
    this.translateService.get('scale.measure.select').subscribe((value: string) => {
      this.placeholder = value;
    });
    const objValues = Object.keys(Measure).map(k => Measure[k]);
    this.measures = objValues.filter(v => typeof v === 'string').map((value: string) => {
      return {
        label: value,
        value: value
      }
    });

    this.scaleVisibilityChangedSubscription = this.scaleService.scaleVisibilityChanged.subscribe((isScaleVisible: boolean) => {
        isScaleVisible ? this.toolDetails.show() : this.toolDetails.hide();
      });

    this.scaleChangedSubscription = this.scaleService.scaleChanged.subscribe(
      scale => {
        this.scale = scale;
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
