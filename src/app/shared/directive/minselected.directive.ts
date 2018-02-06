import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';

@Directive({
  selector: '[appMinSelected]',
  providers: [{provide: NG_VALIDATORS, useExisting: MinSelectedValidator, multi: true}]
})
export class MinSelectedValidator implements Validator {

  @Input() appMinSelected: number;

  validate(control: AbstractControl): { [key: string]: any } {
    return !!control.value && control.value.length < this.appMinSelected ? {'minSelected': {value: control.value}} : null;
  }
}
