import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

@Injectable()
export class DeviceConfigurationService {

  constructor() {}

  getConfigDevices(): Observable<ConfigDevices> {
    return of ({
      radioChannels: [
        { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '7', value: 7 }
      ],
      radioBaudRate: [
        { label: '110', value: 110 }, { label: '850', value: 850 }, { label: '6800', value: 6800 }
      ],
      preambleLength: [
        { label: '64', value: 64 }, { label: '128', value: 128 }, { label: '256', value: 256 }, { label: '512', value: 512 }, { label: '1024', value: 1024 }, { label: '1546', value: 1546 }, { label: '2048', value: 2048 }, { label: '4096', value: 4096 }
      ],
      pulseRepetitionFrequency: [
        { label: '16', value: 16 }, { label: '64', value: 64 }
      ],
      preambleAcquisitionChunk: [
        { label: '8', value: 8 }, { label: '16', value: 16 }, { label: '32', value: 32 }, { label: '64', value: 64 }
      ]
    });
  }

  getDefaultConfigDevices(): Observable<RfConfigDevice> {
    return of ({
      radioChannel: 2,
      radioBaudRate: 850,
      preambleLength: 256,
      pulseRepetitionFrequency: 64,
      preambleAcquisitionChunk: 32,
      communicationCode: 5,
      sfd: 5,
      nsfd: false
    });
  }
}

export interface ConfigDevices {
  radioChannels: object;
  radioBaudRate: object;
  preambleLength: object;
  pulseRepetitionFrequency: object;
  preambleAcquisitionChunk: object;
}

export interface RfConfigDevice {
  radioChannel: number;
  radioBaudRate: number;
  preambleLength: number;
  pulseRepetitionFrequency: number;
  preambleAcquisitionChunk: number;
  communicationCode: number;
  sfd: number;
  nsfd: boolean;
}
