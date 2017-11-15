import {Directive, ElementRef, Inject, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({selector: '[appAutoFocus]'})
export class AppAutoFocusDirective implements OnChanges {
  @Input() appAutoFocus: boolean;

  constructor(@Inject(ElementRef) private element: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('appAutoFocus' in changes && changes['appAutoFocus'].currentValue) {
      setTimeout(() => {
        this.element.nativeElement.focus();
      }, 100);
    }
  }
}
