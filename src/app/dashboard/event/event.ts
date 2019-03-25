import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Event, EventLevel} from './event.type';
import {BatteryState} from '../../device/device.type';
import {DashboardEventService} from './event.service';
import {DashboardService} from '../dashboard.service';

@Component({
  templateUrl: 'event.html',
  selector: 'app-dashboard-event',
  styleUrls: ['event.css']
})
export class EventComponent implements OnInit {

  events: Event[] = [];

  private eventsMap: Map<number, Event> = new Map<number, Event>();

  constructor(public translateService: TranslateService,
              private eventService: DashboardEventService,
              private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
  }

  addBatteryStateEvent(batteryStates: BatteryState[]): void {
    batteryStates.forEach((batteryState: BatteryState) => {
      if (batteryState.percentage < 75 && !this.eventsMap.has(batteryState.deviceShortId)) {
        this.translateService.get(
          'dashboard.event.batteryLevelLow',
          {percentage: batteryState.percentage.toFixed(0)}).subscribe((translated: string) => {
          this.eventsMap.set(batteryState.deviceShortId, {
            level: (batteryState.percentage < 75 && batteryState.percentage > 50 ? EventLevel[EventLevel.WARNING] : EventLevel[EventLevel.DANGER]).toLowerCase(),
            message: translated,
            device: {
              shortId: batteryState.deviceShortId,
              name: this.dashboardService.getDeviceName(batteryState.deviceShortId)
            }
          });
          this.eventService.emitEventAdded();
        });
      } else if (this.eventsMap.has(batteryState.deviceShortId)) {
        this.eventsMap.delete(batteryState.deviceShortId);
        this.eventService.emitEventRemoved();
      }
    });
    this.convertEventsMapToArray();
  }

  private convertEventsMapToArray() {
    this.events = Array.from(this.eventsMap, ([key, value]) => value);
  }
}
