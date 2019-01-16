import {Injectable} from '@angular/core';
import {HttpService} from '../http/http.service';
import {Timer} from '../../utils/timer/timer';

@Injectable()
export class WatchdogService {
  private static INTERVAL = 10_000; // ten seconds
  private timer: Timer;

  constructor(private httpService: HttpService) {
  }

  start(): void {
    this.timer = new Timer(() => {
      if (!document.hidden) {
        this.ping();
      }
    }, WatchdogService.INTERVAL);
    this.timer.startNow();
  }

  ping(): void {
    this.httpService.doGet('auth/watchdog').subscribe();
  }
}
