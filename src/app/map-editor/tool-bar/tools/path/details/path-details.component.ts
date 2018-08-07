import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Floor} from '../../../../../floor/floor.type';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {Subject} from 'rxjs/Subject';
import {PathDetailsService} from '../path-details.service';


@Component({
  selector: 'app-path-details',
  templateUrl: './path-details.component.html',
  styleUrls: ['./path-details.component.css']
})
export class PathDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails')
  toolDetails: ToolDetailsComponent;


  @Input() floor: Floor;

  private subscriptionDestroyer: Subject<void> = new Subject<void>();

  constructor(private pathDetailsService: PathDetailsService) {
  }

  ngOnInit(): void {
    this.pathDetailsService.onVisibilityChange().takeUntil(this.subscriptionDestroyer).subscribe((value: boolean): void => {
      // value ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  ngOnDestroy() {
  }

  confirm(): void {
    this.pathDetailsService.emitDecision(true);
  }

  reject(): void {
    this.pathDetailsService.emitDecision(false);
  }

}
