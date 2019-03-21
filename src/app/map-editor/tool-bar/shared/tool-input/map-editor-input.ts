import {HostListener} from '@angular/core';

export abstract class MapEditorInput {

  abstract active: boolean;

  protected constructor() {
  }

  @HostListener('document:keydown.enter', [])
  handleEnter(): void {
    if (this.active) {
      this.confirm();
    }
  }

  @HostListener('document:keydown.escape', [])
  handleEscape(): void {
    if (this.active) {
      this.reject();
    }
  }

  protected abstract confirm()

  protected abstract reject()

}


