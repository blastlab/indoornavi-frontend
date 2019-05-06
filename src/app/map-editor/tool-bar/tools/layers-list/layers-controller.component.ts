import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {KeyboardDefaultListener} from '../../shared/tool-input/keyboard-default-listener';
import {ToolName} from '../tools.enum';
import {MapSvg} from '../../../../map/map.type';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {ToolbarService} from '../../toolbar.service';
import {Subject} from 'rxjs/Subject';
import {LayersOwner} from '../../../../shared/utils/drawing/layers.owner';


@Component({
  selector: 'app-layers-controller',
  templateUrl: './layers-controller.html'
})
export class LayersControllerComponent extends KeyboardDefaultListener implements Tool, OnInit, OnDestroy {
  active = false;

  disabled: boolean = true;

  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private layersOwner: LayersOwner;

  constructor(private toolbarService: ToolbarService,
              private mapLoaderInformer: MapLoaderInformerService,
  ) {
    super();
    this.layersOwner = LayersOwner.getInstance();
  }
  ngOnInit() {
    this.listenOnMapLoaded();
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  confirm() {
    this.toggleActivity();
  }

  reject() {
    this.toggleActivity();
  }

  toggleActivity(): void {
    console.log('toggle active layers-controller');
    console.log(this.layersOwner);
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  getHintMessage(): string {
    return 'layers-list.hint.first';
  }

  getToolName(): ToolName {
    return ToolName.PATH;
  }

  setActive(): void {
    this.active = true;
  }

  setInactive(): void {
    this.active = false;
  }

  private listenOnMapLoaded(): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      console.log(mapSvg);
    });
  }

}
