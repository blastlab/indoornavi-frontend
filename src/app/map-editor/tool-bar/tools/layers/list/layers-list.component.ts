import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {LayersService} from '../layers.service';
import {ListLayerEntity} from '../../../../../shared/utils/drawing/drawing.builder';

@Component({
  selector: 'app-layers-list',
  templateUrl: './layers-list.html'
})
export class LayersListComponent implements OnInit, OnDestroy {

  layers: ListLayerEntity[] = [];
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  constructor(private layersService: LayersService) {}

  ngOnInit() {
    this.layersService.onLayerListUpdate().takeUntil(this.subscriptionDestructor).subscribe((layers: ListLayerEntity[]): void => {
      this.layers = layers;
      console.log(this.layers);
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }
}
