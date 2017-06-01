import {Component, Input, OnInit} from '@angular/core';
import {Floor} from '../../floor/floor.type';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Scale} from '../../map/toolbar/tools/scale/scale.type';
import {ScaleHintService} from './scale-hint.service';

@Component({
  selector: 'app-scale-hint',
  templateUrl: './scale-hint.html',
  styleUrls: ['./scale-hint.css']
})
export class ScaleHintComponent implements OnInit {
  @Input() scale: Scale;

  constructor(private translate: TranslateService,
              private _scaleHint: ScaleHintService) {
    this._scaleHint.scale$.subscribe(
      data => {
        this.scale = data;
        this.showScaleValue();
      });
  }

  ngOnInit() {
    this.showScaleValue();
  }

  private showScaleValue = (): void => {
    console.log(d3.select('#scaleHint'));
    if (!!this.scale) {
      const msg: string = this.scale.realDistance + ' ' + this.scale.measure;
      d3.select('#scaleHint')
        .text(msg);
    } else {
      d3.select('#scaleHint')
        .text('Scale is not set');
    }
  }
}
