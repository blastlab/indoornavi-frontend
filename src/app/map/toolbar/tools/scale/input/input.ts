import {Component, OnInit} from '@angular/core';
import {Point} from '../../../../map.type';
import {ScaleInputService} from './input.service';
import {Measure, Scale} from '../scale.type';
import {ActivatedRoute, Params} from '@angular/router';
import {ToastService} from '../../../../../utils/toast/toast.service';
import {ScaleHintService} from '../hint/hint.service';
import {ConfigurationService} from '../../../../../floor/configuration/configuration.service';

@Component({
  selector: 'app-scale-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css']
})
export class ScaleInputComponent implements OnInit {

  public visible: boolean = false;
  private coords$: Point;
  public scale: Scale = <Scale>{
    start: null,
    stop: null,
    realDistance: null,
    measure: null
  };
  private floorId: number;
  public measures = [];

  constructor(private scaleInput: ScaleInputService,
              private scaleHint: ScaleHintService,
              private route: ActivatedRoute,
              private toast: ToastService,
              private configurationService: ConfigurationService) {
    this.scaleInput.coordinates$.subscribe(
      data => {
        this.coords$ = data;
        const scaleInputElement = document.getElementById('scaleInput');
        scaleInputElement.style.top = this.coords$.y + 'px';
        scaleInputElement.style.left = this.coords$.x + 'px';
      });
    this.scaleInput.visibility$.subscribe(
      data => {
        this.visible = data;
      });
    this.scaleInput.scale$.subscribe(
      data => {
        this.scale = data;
      });
  }

  ngOnInit() {
    const objValues = Object.keys(Measure).map(k => Measure[k]);
    this.measures = objValues.filter(v => typeof v === 'string') as string[];
    this.route.params.subscribe((params: Params) => {
      this.floorId = +params['floorId'];
    });
  }

  public save(valid: boolean) {
    if (valid) {
      if (!this.scale.measure) {
        this.toast.showFailure('scale.measureNotSet');
        return;
      }
      this.scaleHint.publishScale(this.scale);
      this.scaleInput.publishSaveClicked();
      this.toast.showSuccess('scale.setSuccess');
    } else {
      this.toast.showFailure('scale.mustBeInteger');
    }
  }

  public removeScale() {
    this.scale = <Scale>{
      start: null,
      stop: null,
      realDistance: null,
      measure: null
    };
    this.scaleHint.publishScale(null);
    this.scaleInput.publishScale(this.scale);
    document.getElementById('scaleGroup').remove();
    this.scaleInput.publishRemoveClicked();
    this.visible = false;
  }
}
