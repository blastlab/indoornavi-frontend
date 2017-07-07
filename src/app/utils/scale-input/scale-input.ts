import {Component, OnInit} from '@angular/core';
import {Point} from '../../map/map.type';
import {ScaleInputService} from './scale-input.service';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';
import {ActivatedRoute, Params} from '@angular/router';
import {FloorService} from '../../floor/floor.service';
import {Floor} from '../../floor/floor.type';
import {ToastService} from '../toast/toast.service';
import {ScaleHintService} from '../scale-hint/scale-hint.service';

@Component({
  selector: 'app-scale-input',
  templateUrl: './scale-input.html',
  styleUrls: ['./scale-input.css']
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

  constructor(private _scaleInput: ScaleInputService,
              private _scaleHint: ScaleHintService,
              private route: ActivatedRoute,
              private floorService: FloorService,
              private toast: ToastService) {
    this._scaleInput.coordinates$.subscribe(
      data => {
        this.coords$ = data;
        const scaleInput = document.getElementById('scaleInput');
        scaleInput.style.top = this.coords$.y + 'px';
        scaleInput.style.left = this.coords$.x + 'px';
      });
    this._scaleInput.visibility$.subscribe(
      data => {
        this.visible = data;
      });
    this._scaleInput.scale$.subscribe(
      data => {
        this.scale = data;
      });
  }

  ngOnInit() {
    const objValues = Object.keys(MeasureEnum).map(k => MeasureEnum[k]);
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
      this.floorService.setScale(this.floorId, this.scale).subscribe((floor: Floor) => {
        },
        (errorCode: string) => {
          this.toast.showFailure(errorCode);
        });
      this.toast.showSuccess('scale.set.success');
      this._scaleHint.publishScale(this.scale);
      this._scaleInput.publishSaveClicked();
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
    this._scaleHint.publishScale(null);
    this._scaleInput.publishScale(this.scale);
    document.getElementById('scaleGroup').remove();
    this._scaleInput.publishRemoveClicked();
    this.visible = false;
  }
}
