import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Measure, Scale} from '../scale.type';
import {ScaleHintService} from './hint.service';

@Component({
  selector: 'app-scale-hint',
  templateUrl: './hint.html',
  styleUrls: ['./hint.css']
})
export class ScaleHintComponent implements OnDestroy, OnInit {
  private scale: Scale;

  constructor(private translate: TranslateService,
              private scaleHintService: ScaleHintService) {
  }

  ngOnInit(): void {
    this.scaleHintService.scalePublished.subscribe(
      data => {
        this.scale = data;
        this.showScaleValue();
      });
  }

  public showScaleValue() {
    if (!!this.scale) {
      let unit: String;
      (this.scale.measure.toString() === Measure[Measure.CENTIMETERS]) ? unit = 'cm' : unit = 'm';
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
