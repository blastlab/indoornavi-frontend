import {Component, OnInit} from '@angular/core';
import {ScaleInputService} from './input.service';
import {Measure, Scale} from '../scale.type';
import {ActivatedRoute, Params} from '@angular/router';
import {ToastService} from '../../../../../utils/toast/toast.service';
import {ScaleHintService} from '../hint/hint.service';
import {ScaleService} from '../scale.service';

@Component({
  selector: 'app-scale-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css']
})
export class ScaleInputComponent implements OnInit {

  public visible: boolean = false;
  public scale: Scale = <Scale>{
    start: null,
    stop: null,
    realDistance: null,
    measure: null
  };
  public measures = [];
  private floorId: number;
  private input: HTMLElement;

  constructor(private scaleInput: ScaleInputService,
              private scaleHint: ScaleHintService,
              private route: ActivatedRoute,
              private toast: ToastService,
              private scaleService: ScaleService) {
  }

  ngOnInit() {
    this.input = document.getElementById('scaleInput');
    const objValues = Object.keys(Measure).map(k => Measure[k]);
    this.measures = objValues.filter(v => typeof v === 'string') as string[];
    this.route.params.subscribe((params: Params) => {
      this.floorId = +params['floorId'];
    });
    this.scaleService.coordinatesChanged.subscribe(
      coordinates => {
        this.input.style.top = coordinates.y + 'px';
        this.input.style.left = coordinates.x + 'px';
      });

    this.scaleService.scaleVisibilityChanged.subscribe(
      isScaleVisible => {
        this.visible = isScaleVisible;
      });

    this.scaleInput.scaleChanged.subscribe(
      scale => {
        this.scale = scale;
      });
  }

  public confirm(valid: boolean) {
    if (valid) {
      if (!this.scale.measure) {
        this.toast.showFailure('scale.measureNotSet');
        return;
      }
      this.scaleHint.publishScale(this.scale);
      this.scaleInput.publishSaveClicked(this.scale);
      this.toast.showSuccess('scale.setSuccess');
    } else {
      this.toast.showFailure('scale.mustBeInteger');
    }
  }

}
