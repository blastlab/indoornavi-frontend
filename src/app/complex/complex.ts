import {Component, OnInit} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from "./complex.service";

@Component({
  selector: 'app-root',
  templateUrl: 'complex.html',
  styleUrls: ['complex.css']
})

export class AppComplex implements OnInit {
  public complex: Complex;
  public complexes: Array<Complex> = [];

  public editMode: boolean = false;

  ngOnInit(): void {
    this.complex = {
      name: ''
    };

    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      this.complexes = complexes;
    });
  }

  constructor(private complexService: ComplexService) {}

  public editComplex(complex: Complex): void {
    this.editMode = true;
    this.complex = complex;
  }

  public removeComplex(index: number): void {
    this.complexService.removeComplex(this.complexes[index].id).subscribe(() => {
      this.complexes.splice(index, 1);
    });
  }

  public addComplex(model: Complex, isValid: boolean): void {
    if (isValid) {
      this.complexService.addComplex(model).subscribe((newComplex: Complex) => {
        this.complexes.push(newComplex);
        // TODO: snack bar on success or failure
      });
    }
  }

  public saveComplex(): void {
    this.complexService.updateComplex(this.complex).subscribe(() => {
      this.editMode = false;
    });
  }

  public cancelEdit(): void {
    this.editMode = false;
  }

}
