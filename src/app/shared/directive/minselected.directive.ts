import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[appMinSelected]',
  providers: [{provide: NG_VALIDATORS, useExisting: MinSelectedValidatorDirective, multi: true}]
})
export class MinSelectedValidatorDirective implements Validator {

  @Input() appMinSelected: number;

  validate(control: AbstractControl): ValidationErrors {
    return !control.value || control.value.length < this.appMinSelected ? {'minSelected': {value: control.value}} : null;
  }
}
