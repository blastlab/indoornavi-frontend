import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Config} from '../../../config';
import {Subject} from 'rxjs/Subject';
import {SocketService} from '../../shared/services/socket/socket.service';
import {TagTracerData} from '../../tags-finder/tags-finder.type';
import {DeviceService} from '../../device/device.service';
import {Device} from '../../device/device.type';
import {Timer} from '../../shared/utils/timer/timer';
import {CounterTimer} from './counter.type';

@Component({
  templateUrl: 'counter.html',
  selector: 'app-dashboard-counter',
  styleUrls: ['counter.css']
})
export class CounterComponent implements OnInit, OnDestroy {
  allTags: number = 0;
  activeTags: number = 0;
  @Input() events: number;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private activeTagsMap: Map<number, Timer> = new Map<number, Timer>();

  constructor(public translateService: TranslateService, private socketService: SocketService, private deviceService: DeviceService) {
    this.translateService.setDefaultLang('en');
  }

  ngOnDestroy(): void {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  ngOnInit(): void {
    const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}tagTracer?client`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((tagData: TagTracerData): void => {
      if (this.activeTagsMap.has(tagData.tag.shortId)) {
        this.activeTagsMap.get(tagData.tag.shortId).restart();
      } else {
        this.activeTags++;
        const timer = new CounterTimer((shortId) => {
          this.activeTags--;
          this.activeTagsMap.get(shortId).stop();
          this.activeTagsMap.delete(shortId);
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
}
