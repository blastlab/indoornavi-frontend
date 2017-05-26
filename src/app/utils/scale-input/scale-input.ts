import {Component, OnInit} from '@angular/core';
import {Point} from '../../map/map.type';
import {ScaleInputService} from './scale-input.service';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';
import {ActivatedRoute, Params} from "@angular/router";
import {FloorService} from "../../floor/floor.service";
import {Floor} from "../../floor/floor.type";

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
              private route: ActivatedRoute,
              private floorService: FloorService) {
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
      console.log(this.floorId);
    });
  }

  public submit() {
    console.log(this.scale);
    console.log(this.scale.realDistance);
    this.floorService.setScale(this.floorId, this.scale).subscribe((floor: Floor) => {
    })
  }
}
