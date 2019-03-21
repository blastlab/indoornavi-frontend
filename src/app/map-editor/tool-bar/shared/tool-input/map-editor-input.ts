import {HostListener} from '@angular/core';

export abstract class MapEditorInput {

  visible: boolean;

  protected constructor() {}

  @HostListener('document:keydown.enter', [])
  handleEnter(): void {
    if (this.visible) {
      this.confirm();
    }
  }

  @HostListener('document:keydown.escape', [])
  handleEscape(): void {
    if (this.visible) {
      this.reject();
    }
  }

  confirm() {}

  reject() {}

}
