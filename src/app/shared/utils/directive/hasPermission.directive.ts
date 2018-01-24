import {Directive, ElementRef, Input, OnInit, Renderer} from '@angular/core';

@Directive({selector: '[appHasPermission]'})
export class AppHasPermissionDirective implements OnInit {
  @Input() appHasPermission: string;

  constructor(private el: ElementRef, private renderer: Renderer) {
  }

  ngOnInit(): void {
    if (localStorage.getItem('currentUser')) {
      const roles: Array<string> = JSON.parse(localStorage.getItem('currentUser'))['permissions'];
      if (roles.indexOf(this.appHasPermission) === -1) {
        this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
      }
    }
  }
}
