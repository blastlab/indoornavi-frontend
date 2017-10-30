import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Measure, Scale} from '../scale.type';
import {ScaleHintService} from './hint.service';
import {ScaleService} from '../scale.service';

@Component({
  selector: 'app-scale-hint',
  templateUrl: './hint.html',
  styleUrls: ['./hint.css']
})
export class ScaleHintComponent implements OnDestroy, OnInit {
  private scale: Scale;
  private scaleHint: d3.selection;

  constructor(private translate: TranslateService,
              private scaleHintService: ScaleHintService,
              private scaleService: ScaleService) {
  }

  ngOnInit(): void {
    this.scaleHint = d3.select('#scaleHint');

    this.scaleHintService.scaleChanged.subscribe(
      data => {
        this.scale = data;
        this.showScaleValue();
      });
    this.showScaleValue();

    this.scaleService.scaleVisibilityChanged.subscribe((isScaleVisible: boolean) => {
      this.toggleHintVisibility(isScaleVisible);
    });
    this.toggleHintVisibility(false);
  }

  public showScaleValue() {
    if (!!this.scale && !!this.scale.measure) {
      let unit: String;
      (this.scale.measure.toString() === Measure[Measure.CENTIMETERS]) ? unit = 'cm' : unit = 'm';
      this.translate.get('scale').subscribe((value: string) => {
        this.scaleHint
          .text(value + ': ' + this.scale.realDistance + ' ' + unit);
      });
    } else {
      this.translate.get('scale.isNotSet').subscribe((value: string) => {
        this.scaleHint
          .text(value);
      });
    }
  }

  private toggleHintVisibility(isScaleVisible: boolean) {
    if (isScaleVisible) {
      this.scaleHint
        .on('mouseover', null)
        .on('mouseout', null);
    } else {
      this.scaleHint
        .on('mouseover', () => {
          this.scaleHintService.mouseHover('over');
        })
        .on('mouseout', () => {
          this.scaleHintService.mouseHover('out');
        });
    }
  }

  ngOnDestroy() {
    this.scale = null;
  }
}
