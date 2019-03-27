import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ScaleInputService} from './input.service';
import {Measure, Scale} from '../scale.type';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {MessageServiceWrapper} from '../../../../../shared/services/message/message.service';
import {SelectItem} from 'primeng/primeng';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {MapEditorInput} from '../../../shared/tool-input/map-editor-input';

@Component({
  selector: 'app-scale-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css']
})
export class ScaleInputComponent extends MapEditorInput implements OnInit, OnDestroy {
  @ViewChild('toolDetails') toolDetails: ToolDetailsComponent;
  scale: Scale;
  measures: SelectItem[] = [];
  active = false;

  private scaleChangedSubscription: Subscription;
  private scaleVisibilityChangedSubscription: Subscription;

  constructor(private messageService: MessageServiceWrapper,
              private scaleService: ScaleService,
              private scaleInputService: ScaleInputService) {
    super();
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
      if (isScaleVisible) {
        this.toolDetails.show();
        this.active = true;
      } else {
        this.toolDetails.hide();
        this.active = false;
      }
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

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
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
