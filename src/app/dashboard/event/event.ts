import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Event, EventLevel} from './event.type';

@Component({
  templateUrl: 'event.html',
  selector: 'app-dashboard-event',
  styleUrls: ['event.css']
})
export class EventComponent implements OnInit {

  events: Event[] = [];

  constructor(public translateService: TranslateService) {
    this.translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    // TODO: connect to info websocket
    this.events.push({
      level: EventLevel[EventLevel.DANGER].toLowerCase(),
      message: 'Battery level is 15%',
      areaName: 'N/a',
      deviceName: 'Tag no. 1'
    });

    this.events.push({
      level: EventLevel[EventLevel.WARNING].toLowerCase(),
      message: 'Battery level is 55%',
      areaName: 'N/a',
      deviceName: 'Tag no. 2'
    });

    this.events.push({
      level: EventLevel[EventLevel.WARNING].toLowerCase(),
      message: 'Battery level is 75%',
      areaName: 'N/a',
      deviceName: 'Tag no. 3'
    });
  }
}
