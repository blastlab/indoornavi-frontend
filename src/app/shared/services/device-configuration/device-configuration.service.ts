import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

@Injectable()
export class DeviceConfigurationService {

  constructor() {}

  getradioChannels() {
    return of([{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '7', value: 7 }]);
  }

  getRadioBaudRate(): Observable<DeviceConfiguration[]> {
    return of([{ label: '110', value: 110 }, { label: '850', value: 850 }, { label: '6800', value: 6800 }]);
  }

  getPreambleLength(): Observable<DeviceConfiguration[]> {
    return of([{ label: '64', value: 64 }, { label: '128', value: 128 }, { label: '256', value: 256 }, { label: '512', value: 512 }, { label: '1024', value: 1024 },
      { label: '1546', value: 1546 }, { label: '2048', value: 2048 }, { label: '4096', value: 4096 }]);
  }

  getPulseRepetitionFrequency(): Observable<DeviceConfiguration[]> {
    return of([{ label: '16', value: 16 }, { label: '64', value: 16 }]);
  }

  getPreambleAcquisitionChunk(): Observable<DeviceConfiguration[]> {
    return of([{ label: '8', value: 8 }, { label: '16', value: 16 }, { label: '32', value: 32 }, { label: '64', value: 16 }]);
  }
}

export interface DeviceConfiguration {
  label: string,
  value: number
}
