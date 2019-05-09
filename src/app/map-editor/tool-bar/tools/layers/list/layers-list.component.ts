import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {LayersService} from '../layers.service';
import {ListLayerEntity} from '../../../../../shared/utils/drawing/drawing.builder';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';

@Component({
  selector: 'app-layers-list',
  templateUrl: './layers-list.html'
})
export class LayersListComponent implements OnInit, OnDestroy {

  @ViewChild('toolDetails') toolDetails: ToolDetailsComponent;
  layers: ListLayerEntity[] = [];
  visible: boolean = false;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  constructor(
    private layersService: LayersService
              ) {}

  ngOnInit() {
    this.layersService.onLayerListUpdate().takeUntil(this.subscriptionDestructor).subscribe((layers: ListLayerEntity[]): void => {
      this.layers = layers;
    });
    this.layersService.onListVisibilityChange().takeUntil(this.subscriptionDestructor).subscribe((value: boolean) => {
      value ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  changeVisibility(id: number): void {
    this.layersService.emitLayerVisibilityChange(id);
  }
}
