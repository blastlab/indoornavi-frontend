import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from "./complex.service";
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {ComplexDialog} from './complex.dialog';

@Component({
  selector: 'app-root',
  templateUrl: 'complex.html',
  styleUrls: ['complex.css']
})

export class AppComplex implements OnInit {
  public complex: Complex;
  public complexes: Array<Complex> = [];

  private dialogRef: MdDialogRef<any>;

  ngOnInit(): void {
    this.complex = {
      name: ''
    };

    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      console.log(complexes);
      this.complexes = complexes;
    });
  }

  constructor(private complexService: ComplexService,
              public dialog: MdDialog,
              public viewContainerRef: ViewContainerRef) {}

  public editComplex(complex: Complex): void {
    let config = new MdDialogConfig();
    config.viewContainerRef = this.viewContainerRef;
    this.dialogRef = this.dialog.open(ComplexDialog, config);
    this.dialogRef.componentInstance.newComplexName = complex.name;

    this.complex = complex;

    this.dialogRef.afterClosed().subscribe(result => {
      this.complex.name = this.dialogRef.componentInstance.newComplexName;
      this.dialogRef = null;
      this.saveComplex();
    });

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
      // TODO: action after edit?
    });
  }

}
