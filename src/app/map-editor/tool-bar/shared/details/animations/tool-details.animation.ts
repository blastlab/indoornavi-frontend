import {animate, state, style, transition, trigger} from '@angular/animations';

export const minimizeContainerAnimation = trigger('toggleMinimizedTop', [
  state('maximized', style({
    transform: 'translateX(0)'
  })),
  state('minimized', style({
    transform: 'translateX({{ minimizeContainerShift }})'
  }), { params: { minimizeContainerShift: '-500px' } }),
  transition('minimized <=> maximized', animate(250))
]);


export const contentContainerAnimation = trigger('toggleMinimizedBottom', [
  state('maximized', style({
    transform: 'translateY(0)'
  })),
  state('minimized', style({
    transform: 'translateY({{ contentContainerShift }})'
  }), { params: { contentContainerShift: '-500px' } }),
  transition('minimized <=> maximized', animate(250))
]);


export const openCloseAnimation = trigger('toggleDetails', [
  state('open', style({
    transform: 'translateY(0)'
  })),
  state('close', style({
    transform: 'translateY(-100%)'
  })),
  transition('close <=> open', animate(300))
]);

