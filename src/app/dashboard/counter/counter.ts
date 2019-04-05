import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Config} from '../../../config';
import {Subject} from 'rxjs/Subject';
import {SocketService} from '../../shared/services/socket/socket.service';
import {TagTracerData} from '../../tags-finder/tags-finder.type';
import {DeviceService} from '../../device/device.service';
import {Device} from '../../device/device.type';
import {Timer} from '../../shared/utils/timer/timer';
import {CounterTimer} from './counter.type';
import {DashboardEventService} from '../event/event.service';

@Component({
  templateUrl: 'counter.html',
  selector: 'app-dashboard-counter',
  styleUrls: ['counter.css'],
  providers: [SocketService]
})
export class CounterComponent implements OnInit, OnDestroy {
  allTags: number = 0;
  activeTags: number = 0;
  events: number = 0;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private activeTagsMap: Map<number, Timer> = new Map<number, Timer>();

  constructor(public translateService: TranslateService,
              private tagTracerSocket: SocketService,
              private deviceService: DeviceService,
              private eventService: DashboardEventService) {
    this.translateService.setDefaultLang('en');
  }

  ngOnDestroy(): void {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  ngOnInit(): void {
    this.handleTagsCounter();
    this.handleEventsCounter();
  }

  private handleTagsCounter() {
    const stream = this.tagTracerSocket.connect(`${Config.WEB_SOCKET_URL}tagTracer?frontend`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((tagData: TagTracerData): void => {
      if (this.activeTagsMap.has(tagData.tag.shortId)) {
        this.activeTagsMap.get(tagData.tag.shortId).restart();
      } else {
        this.activeTags++;
        const timer = new CounterTimer((shortId) => {
          if (this.activeTagsMap.has(shortId)) {
            this.activeTags--;
            this.activeTagsMap.get(shortId).stop();
            this.activeTagsMap.delete(shortId);
          }
        }, 5000, tagData.tag.shortId);
        timer.start();
        this.activeTagsMap.set(tagData.tag.shortId, timer);
      }
    });
    this.deviceService.setUrl('tags/');
    this.deviceService.getAll().subscribe((devices: Device[]) => {
      this.allTags = devices.length;
    });
  }

  private handleEventsCounter() {
    this.eventService.onEventAdded().takeUntil(this.subscriptionDestroyer).subscribe(() => {
      this.events++;
    });
    this.eventService.onEventRemoved().takeUntil(this.subscriptionDestroyer).subscribe(() => {
      this.events--;
    });
  }
}
