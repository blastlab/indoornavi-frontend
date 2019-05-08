import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {LayersService} from '../layers.service';
import {ListLayerEntity} from '../../../../../shared/utils/drawing/drawing.builder';
import {AcceptButtonsService} from '../../../../../shared/components/accept-buttons/accept-buttons.service';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';

@Component({
  selector: 'app-layers-list',
  templateUrl: './layers-list.html'
})
export class LayersListComponent implements OnInit, OnDestroy {

  @ViewChild('toolDetails') toolDetails: ToolDetailsComponent;
  layers: ListLayerEntity[] = [];
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  constructor(
    private layersService: LayersService,
    private acceptButtonsService: AcceptButtonsService
              ) {}

  ngOnInit() {
    this.acceptButtonsService.visibilityChanged.subscribe((value: boolean) => {
      value ? this.toolDetails.show() : this.toolDetails.hide();
    });
    this.layersService.onLayerListUpdate().takeUntil(this.subscriptionDestructor).subscribe((layers: ListLayerEntity[]): void => {
      this.layers = layers;
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
