import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {contentContainerAnimation, minimizeContainerAnimation, openCloseAnimation} from './animations/tool-details.animation';
import {Subject} from 'rxjs/Subject';
import {DevicePlacerService} from '../../tools/device-placer/device-placer.service';

@Component({
  selector: 'app-tool-details',
  templateUrl: './tool-details.html',
  styleUrls: ['./tool-details.css'],
  animations: [
    openCloseAnimation,
    contentContainerAnimation,
    minimizeContainerAnimation
  ]
})
export class ToolDetailsComponent implements OnDestroy, OnInit {

  state: string = 'close';
  contentContainerState: string = 'maximized';
  minimizeContainerState: string = 'maximized';
  @Output() onHide: EventEmitter<any> = new EventEmitter();
  @ViewChild('parentContainer') parentContainer: ElementRef;
  @ViewChild('minimizeContainer') minimizeContainer: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  minimizeContainerShift: string = '0px';
  contentContainerShift: string = '0px';

  subscriptionDestructor: Subject<void> = new Subject<void>();

  private buttonWidthAndPadding = 40;

  constructor(private cd: ChangeDetectorRef, private devicePlacerService: DevicePlacerService) {
  }

  ngOnInit() {
    this.devicePlacerService.onDragStarted.takeUntil(this.subscriptionDestructor).subscribe(() => {
      this.contentContainerState = 'minimized'
    });
    this.devicePlacerService.onDroppedOutside.takeUntil(this.subscriptionDestructor).subscribe(() => {
      this.minimizeContainerState = 'maximized'
    });
    this.devicePlacerService.onDroppedInside.takeUntil(this.subscriptionDestructor).subscribe(() => {
      this.minimizeContainerState = 'maximized'
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  show(): void {
    this.updateContainersShifts();
    this.state = 'open';
  }

  hide(): void {
    this.state = 'close';
  }

  toggleMinimized(): void {
    if (this.contentContainerState === 'maximized') {
      this.contentContainerState = 'minimized';
    } else {
      this.minimizeContainerState = 'maximized';
    }
  }

  contentContainerAnimationEnded(event: AnimationEvent): void {
    if (event.fromState === 'maximized' && event.toState === 'minimized') {
      this.minimizeContainerState = 'minimized';
      this.parentContainer.nativeElement.style['pointer-events'] = 'none';
    }
  }

  minimizeContainerAnimationEnded(event: AnimationEvent): void {
    if (event.fromState === 'minimized' && event.toState === 'maximized') {
      this.contentContainerState = 'maximized';
      this.parentContainer.nativeElement.style['pointer-events'] = 'auto';
    }
  }

  emitOnHide(): void {
    this.onHide.next();
  }

  updateContainersShifts(): void {
    this.minimizeContainerShift = `-${(this.minimizeContainer.nativeElement.getBoundingClientRect().width - this.buttonWidthAndPadding)}px`;
    this.contentContainerShift = `-${(this.minimizeContainer.nativeElement.getBoundingClientRect().height + this.contentContainer.nativeElement.getBoundingClientRect().height)}px`;
    if (!this.cd['destroyed']) {
      this.cd.detectChanges();
    }
  }

}



