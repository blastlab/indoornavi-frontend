import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Scale, MeasureEnum} from '../scale.type';
import {ScaleHintService} from './hint.service';

@Component({
  selector: 'app-scale-hint',
  templateUrl: './hint.html',
  styleUrls: ['./hint.css']
})
export class ScaleHintComponent implements OnDestroy, OnInit {
  @Input() scale: Scale;

  constructor(private translate: TranslateService,
              private _scaleHint: ScaleHintService) {
  }

  ngOnInit(): void {
    this._scaleHint.scale$.subscribe(
      data => {
        this.scale = data;
        this.showScaleValue();
      });
  }

  public showScaleValue() {
    if (!!this.scale) {
      let unit: String;
      (this.scale.measure.toString() === MeasureEnum[0]) ? unit = 'cm' : unit = 'm';
      this.translate.get('scale').subscribe((value: string) => {
        d3.select('#scaleHint')
          .text(value + ': ' + this.scale.realDistance + ' ' + unit);
      });
    } else {
      this.translate.get('scale.isNotSet').subscribe((value: string) => {
        d3.select('#scaleHint')
          .text(value);
      });
    }
  }

  ngOnDestroy() {
    this.scale = null;
  }
}
