import {animate, state, style, transition, trigger} from '@angular/animations';

export const minimizeContainerAnimation = trigger('toggleMinimizedTop', [
  state('maximized', style({
    transform: 'translateX(0)'
  })),
  state('minimized', style({
    transform: 'translateX(-{{ width }})'
  }), { params: { width: '500px' } }),
  transition('minimized <=> maximized', animate(250))
]);


export const contentContainerAnimation = trigger('toggleMinimizedBottom', [
  state('maximized', style({
    transform: 'translateY(0)'
  })),
  state('minimized', style({
    transform: 'translateY(-{{ height }})'
  }), { params: { height: '500px' } }),
  transition('minimized <=> maximized', animate(250))
]);

