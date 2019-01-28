import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {TerminalMessageService} from './terminal-message.service';
import {ClientRequest, CommandArguments, CommandType, DeviceMessage, TerminalMessage} from '../device.type';
import {TranslateService} from '@ngx-translate/core';
import {TerminalService} from 'primeng/components/terminal/terminalservice';

@Component({
  templateUrl: './terminal.html',
  selector: 'app-terminal-component',
  encapsulation: ViewEncapsulation.None
})
export class TerminalComponent implements OnInit, OnDestroy {

  public displayTerminalWindow = false;
  public terminalWelcomeMessage: string;
  public terminalResponseMessage: TerminalMessage[] = [];
  public terminalActiveDeviceId: number;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private terminalPause: boolean = false;
  private availableCommands: string[];
  private connectedToWebSocket: boolean = false;
  private usedCommands: string[] = [];
  private terminalComponent: Element;
  private commandIndex: number;
  private activeCommand: string;
  private scrolledTop: boolean = true;
  private terminalResponseWindow: Element;
  private terminalResponseWindowHeight: number;

  constructor(
    public translate: TranslateService,
    private terminalMessageService: TerminalMessageService,
    private terminalService: TerminalService
  ) {

  }

  ngOnInit() {
    this.setCommands();
    this.listenToTerminalKeyDown();
    this.setTerminalCommandHandler();
    this.terminalResponseWindowHeight = document.getElementById('informationWindow').scrollHeight;
    this.translate.setDefaultLang('en');
    this.translate.get('terminal.window.welcome').first().subscribe((value: string): void => {
      this.terminalWelcomeMessage = value;
    });
    this.terminalMessageService.onTerminalInitialized().takeUntil(this.subscriptionDestructor).subscribe((deviceId: number): void => {
      this.terminalResponseMessage = [];
      this.terminalActiveDeviceId = deviceId;
      this.displayTerminalWindow = !this.displayTerminalWindow;
      this.connectedToWebSocket = false;
      this.terminalComponent = null;
      this.activeCommand = null;
      this.clearTerminal();
    });
    this.terminalMessageService.onTerminalCommand().takeUntil(this.subscriptionDestructor).subscribe((message: DeviceMessage): void => {
      this.handleServerCommandResponse(message);
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    this.removeTerminalKeyDownListener();
  }

  private setTerminalCommandHandler(): void {
    this.terminalService.commandHandler.takeUntil(this.subscriptionDestructor).subscribe((command: string): void => {
      let responseMessage = '';
      let responseData = '';
      switch (command.toLowerCase()) {
        case 'help':
          responseMessage = 'terminal.activeCommandsList';
          responseData = this.availableCommands.join(', ');
          break;
        case 'exit':
          this.displayTerminalWindow = false;
          this.connectedToWebSocket = false;
          break;
        case 'freeze':
          this.terminalPause = true;
          responseMessage = 'terminal.window.pause';
          break;
        case 'unfreeze':
          this.terminalPause = false;
          responseMessage = 'terminal.window.resume';
          break;
        case 'clear':
          responseMessage = 'terminal.window.clear';
          this.clearTerminal();
          break;
        case 'use':
          if (!!this.activeCommand) {
            responseMessage = 'terminal.command.sentToDevice.active';
            this.handleDeviceCommand(this.activeCommand);
            this.activeCommand = null;
          } else {
            responseMessage = 'terminal.command.notActive';
          }
          break;
        default:
          responseMessage = 'terminal.command.sentToDevice.active';
          this.sendResponseToTerminal(responseMessage, responseData);
          this.handleDeviceCommand(command);
          this.usedCommands.push(command);
          this.displayMessage(command, true)
      }
    });
  }

  private handleServerCommandResponse(message: DeviceMessage): void {
    if (this.displayTerminalWindow && message.sinkShortId === this.terminalActiveDeviceId) {
      this.displayMessage(message.value, false)
    }
  }

  private clearTerminal(): void {
    const components: Element[] = [].slice.call(document.getElementsByClassName('ui-terminal-command'));
    components.forEach((element: Element): void => {
      const elementFather: Node = element.parentNode;
      while (elementFather.firstChild) {
        elementFather.removeChild(elementFather.firstChild);
      }
    });
  }

  private displayMessage(value: string, internal: boolean): void {
    const message: TerminalMessage = {
      message: value,
      internal: internal
    };
    this.terminalResponseMessage.push(message);
    this.terminalResponseWindow = document.getElementById('informationWindow');
    this.setScrollReaction();
    if (!this.terminalPause) {
      if (this.terminalResponseMessage.length > 1000) {
        this.terminalResponseMessage.splice(0, 1);
      }
      if (this.scrolledTop) {
        this.zeroScrollTop();
      }
    }
  }

  private setScrollReaction(): void {
    this.scrolledTop = (this.terminalResponseWindow.scrollTop + this.terminalResponseWindowHeight - this.terminalResponseWindow.scrollHeight > -40);
  }

  private zeroScrollTop(): void {
    this.terminalResponseWindow.scrollTop = this.terminalResponseWindow.scrollHeight;
  }

  private listenToTerminalKeyDown(): void {
    this.terminalComponent = [].slice.call(document.getElementsByClassName('ui-terminal-input'))[0];
    this.terminalComponent.addEventListener('keyup', this.handleKeyDown.bind(this), false);
  }

  private removeTerminalKeyDownListener(): void {
    this.terminalComponent.removeEventListener('keyup', this.handleKeyDown.bind(this), false);
    this.terminalComponent = null;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.commandIndex === null || this.commandIndex === undefined) {
      return;
    }
    if (event.keyCode === 38 && this.commandIndex > 0) {
      this.insertCommandToTerminal(this.usedCommands[--this.commandIndex])
    } else if (event.keyCode === 40 && this.commandIndex < this.usedCommands.length - 1) {
      this.insertCommandToTerminal(this.usedCommands[++this.commandIndex])
    } else if (event.keyCode === 38 || event.keyCode === 40) {
      this.insertCommandToTerminal(this.usedCommands[this.commandIndex]);
    }
  }

  private insertCommandToTerminal(command: string): void {
    this.activeCommand = command;
    this.sendResponseToTerminal('terminal.command.sentToDevice.active', command);
  }

  private setCommands(): void {
    this.availableCommands = [
      'help',
      'freeze',
      'unfreeze',
      'clear',
      'exit',
      'use'
    ];
  }

  private handleDeviceCommand(command: string): void {
    this.commandIndex = this.usedCommands.length;
    if (this.usedCommands.length > 100) {
      this.usedCommands.splice(0, 1);
    }
    const commandArguments: CommandArguments = {
      value: command,
      sinkShortId: this.terminalActiveDeviceId
    };
    const socketPayload: ClientRequest = {
      type: CommandType[CommandType.RAW_COMMAND],
      args: commandArguments
    };
    this.terminalMessageService.sendClientRequest(socketPayload);
  }

  private sendResponseToTerminal(responseMessage: string, responseData: string): void {
    this.translate.get(responseMessage).first().subscribe((message: string) => {
      const value = `${message} ${responseData}`;
      this.terminalService.sendResponse(value);
    });
  }
}
