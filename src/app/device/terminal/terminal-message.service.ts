import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {ClientRequest, DeviceMessage} from '../device.type';

@Injectable()
export class TerminalMessageService {
  private terminalOnDeviceInitialize: Subject<number> = new Subject<number>();
  private terminalCommand: Subject<DeviceMessage> = new Subject<DeviceMessage>();
  private clientRequest: Subject<ClientRequest> = new Subject<ClientRequest>();

  setTerminalForDevice(deviceId: number): void {
    this.terminalOnDeviceInitialize.next(deviceId);
  }

  onTerminalInitialized(): Observable<number> {
    return this.terminalOnDeviceInitialize.asObservable();
  }

  sendCommandToTerminal(message: DeviceMessage): void {
    this.terminalCommand.next(message);
  }

  onTerminalCommand(): Observable<DeviceMessage> {
    return this.terminalCommand.asObservable();
  }

  sendClientRequest(command: ClientRequest): void {
    this.clientRequest.next(command);
  }

  onClientRequest(): Observable<ClientRequest> {
    return this.clientRequest.asObservable();
  }
}
