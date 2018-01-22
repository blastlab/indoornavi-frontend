import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {TranslateService} from '@ngx-translate/core';
import {Measure, Scale} from '../scale.type';
import {ScaleHintService} from './hint.service';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {Geometry} from '../../../../../shared/utils/helper/geometry';

@Component({
  selector: 'app-scale-hint',
  templateUrl: './hint.html'
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

    this.scaleService.scaleChanged.subscribe(
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
      const unit = (this.scale.measure.toString() === Measure[Measure.CENTIMETERS]) ? 'cm' : 'm',
        pixels = Math.round(Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop));
      this.translate.get('scale').subscribe((value: string) => {
        this.scaleHint
          .text(`${value}: ${pixels}px = ${this.scale.realDistance}${unit}`);
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
