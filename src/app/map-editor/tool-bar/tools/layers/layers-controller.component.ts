import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {KeyboardDefaultListener} from '../../shared/tool-input/keyboard-default-listener';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {LayersOwner} from '../../../../shared/utils/drawing/layers.owner';
import {LayersService} from './layers.service';
import {AcceptButtonsService} from '../../../../shared/components/accept-buttons/accept-buttons.service';
import {Subject} from 'rxjs/Subject';


@Component({
  selector: 'app-layers-controller',
  templateUrl: './layers-controller.html'
})
export class LayersControllerComponent extends KeyboardDefaultListener implements Tool, OnInit, OnDestroy {
  active = false;

  disabled: boolean = true;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private readonly layersOwner: LayersOwner;

  constructor(
    private toolbarService: ToolbarService,
    private layersService: LayersService
  ) {
    super();
    this.layersOwner = LayersOwner.getInstance();
  }

  ngOnInit() {
    this.layersService.onLayerVisibilityChange().takeUntil(this.subscriptionDestructor).subscribe((layerId: number): void  => {
      this.layersOwner.getLayerVisibilityById(layerId) ? this.layersOwner.hideLayerById(layerId) : this.layersOwner.showLayerById(layerId);
      this.layersService.emitLayersListUpdate(this.layersOwner.getIdsAndNames());
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  confirm() {
    this.toggleActivity();
  }

  reject() {
    this.toggleActivity();
  }

  toggleActivity(): void {
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
      this.layersService.emitListVisibility(false);
    } else {
      this.layersService.emitLayersListUpdate(this.layersOwner.getIdsAndNames()); // todo: check it should be emitted each time
      this.layersService.emitListVisibility(true);
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
    return ToolName.LAYERS;
  }

  setActive(): void {
    this.active = true;
    this.layersService.emitListVisibility(true);
  }

  setInactive(): void {
    this.layersService.emitListVisibility(false);
    this.active = false;
  }

}
