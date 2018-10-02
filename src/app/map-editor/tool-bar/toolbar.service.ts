import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Tool} from './tools/tool';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ToolbarService {
  private changed = new Subject<Tool>();
  private disableWizard: Subject<boolean> = new Subject<boolean>();

  wizardDisabled = this.disableWizard.asObservable();

  onToolChanged(): Observable<Tool> {
    return this.changed.asObservable();
  }

  emitToolChanged(tool: Tool): void {
    this.changed.next(tool);
  }

  setWizardDisabled(disabled: boolean): void {
    this.disableWizard.next(disabled);
  }

}
