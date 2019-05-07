import {Component} from '@angular/core';
import {Tool} from '../tool';
import {KeyboardDefaultListener} from '../../shared/tool-input/keyboard-default-listener';
import {ToolName} from '../tools.enum';
import {ToolbarService} from '../../toolbar.service';
import {LayersOwner} from '../../../../shared/utils/drawing/layers.owner';
import {LayersService} from './layers.service';


@Component({
  selector: 'app-layers-controller',
  templateUrl: './layers-controller.html'
})
export class LayersControllerComponent extends KeyboardDefaultListener implements Tool {
  active = false;

  disabled: boolean = true;
  private readonly layersOwner: LayersOwner;

  constructor(
    private toolbarService: ToolbarService,
    private layersService: LayersService
  ) {
    super();
    this.layersOwner = LayersOwner.getInstance();
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
    } else {
      this.layersService.emitLayersListUpdate(this.layersOwner.getIdsAndNames()); // todo: check it should be emitted each time
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

}
