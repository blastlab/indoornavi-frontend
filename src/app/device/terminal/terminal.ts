import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {TerminalMessageService} from './terminal-message.service';
import {ClientRequest, CommandArguments, CommandType, DeviceMessage, TerminalMessage} from '../device.type';
import {TranslateService} from '@ngx-translate/core';
import {TerminalService} from 'primeng/components/terminal/terminalservice';
import {Terminal} from 'primeng/primeng';
import Stack from 'typescript-collections/dist/lib/Stack';

@Component({
  templateUrl: './terminal.html',
  selector: 'app-terminal-component',
  encapsulation: ViewEncapsulation.None
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewInit {

  public displayTerminalWindow = false;
  public terminalWelcomeMessage: string;
  public terminalResponseMessage: TerminalMessage[] = [];
  public terminalActiveDeviceId: number;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private terminalPause: boolean = false;
  private availableCommands: string[];
  private usedCommands: string[] = [];
  private commandIndex: number;
  private activeCommand: string;
  private scrolledTop: boolean = true;
  private terminalResponseWindow: Element;
  private terminalResponseWindowHeight: number;
  @ViewChild(Terminal) terminal: Terminal;

  private static isArrowUp(event: KeyboardEvent): boolean {
    return event.keyCode === 38;
  }

  private static isArrowDown(event: KeyboardEvent): boolean {
    return event.keyCode === 40;
  }

  constructor(
    public translate: TranslateService,
    private terminalMessageService: TerminalMessageService,
    private terminalService: TerminalService,
    private renderer: Renderer2
  ) {

  }

  ngOnInit() {
    this.setCommands();
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
      this.activeCommand = null;
      this.clearTerminal();
      this.focusOnInput();
    });
    this.terminalMessageService.onTerminalCommand().takeUntil(this.subscriptionDestructor).subscribe((message: DeviceMessage): void => {
      this.handleServerCommandResponse(message);
    });
  }

  ngAfterViewInit(): void {
    this.renderer.listen(this.renderer.selectRootElement('.ui-terminal-input'), 'keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
      if (TerminalComponent.isArrowUp(event) || TerminalComponent.isArrowDown(event)) {
        this.terminal.command = this.activeCommand;
        const commandLength = this.activeCommand.length;

        setTimeout(() => {
          this.renderer.selectRootElement('.ui-terminal-input').setSelectionRange(commandLength, commandLength);
        });
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  private closeTerminal(): void {
    this.terminalPause = false;
    this.displayTerminalWindow = false;
  }

  private setTerminalCommandHandler(): void {
    this.terminalService.commandHandler.takeUntil(this.subscriptionDestructor).subscribe((command: string): void => {
      let responseMessage = '';
      let responseData = '';
      switch (command.toLowerCase()) {
        case 'help':
          responseMessage = 'terminal.activeCommandsList';
          responseData = this.availableCommands.join(', ');
          this.terminal.commands.push({text: responseData});
          break;
        case 'exit':
          this.closeTerminal();
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
        default:
          responseMessage = 'terminal.command.sentToDevice.active';
          this.handleDeviceCommand(command);
          if (this.usedCommands[this.commandIndex] !== command) {
            this.usedCommands.push(command);
          }
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

  private handleKeyDown(event: KeyboardEvent): void {
    let command: string;
    if (TerminalComponent.isArrowUp(event) && this.commandIndex < this.usedCommands.length - 1) {
      command = this.usedCommands[++this.commandIndex];
    } else if (TerminalComponent.isArrowDown(event) && this.commandIndex > 0) {
      command = this.usedCommands[--this.commandIndex];
    } else if (TerminalComponent.isArrowDown(event) || TerminalComponent.isArrowUp(event)) {
      command = this.usedCommands[this.commandIndex];
    }
    this.insertCommandToTerminal(command);
  }

  private insertCommandToTerminal(command: string): void {
    this.activeCommand = command;
  }

  private setCommands(): void {
    this.availableCommands = [
      'help',
      'freeze',
      'unfreeze',
      'clear',
      'exit'
    ];
  }

  private handleDeviceCommand(command: string): void {
    this.commandIndex = this.usedCommands.length;
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

  private focusOnInput(): void {
    setTimeout(() => {
      this.terminal.focus(this.renderer.selectRootElement('.ui-terminal-input'));
    });
  }
}
