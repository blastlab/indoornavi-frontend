import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: number = 0;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  ngOnInit(): void {
  }
}
