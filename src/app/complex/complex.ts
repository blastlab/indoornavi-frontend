import {Component, OnInit, ViewChild} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from "./complex.service";
import {MdDialog, MdDialogRef} from '@angular/material';
import {ComplexDialog} from './complex.dialog';
import {ToastService} from "../utils/toast/toast.service";
import {NgForm} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: 'complex.html',
  styleUrls: ['complex.css']
})

export class AppComplex implements OnInit {

  complexes: Array<Complex> = [];

  private complex: Complex;
  private dialogRef: MdDialogRef<ComplexDialog>;

  @ViewChild('complexForm') complexForm: NgForm;

  ngOnInit(): void {
    this.newComplex();

    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      this.complexes = complexes;
    });
  }

  constructor(private complexService: ComplexService,
              private dialog: MdDialog,
              private toast: ToastService,
              private router: Router)
  {}

  editComplex(complex: Complex): void {
    this.dialogRef = this.dialog.open(ComplexDialog);
    this.dialogRef.componentInstance.setName(complex.name);

    this.dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) { // dialog has been closed without save button clicked
        // TODO: do we do anything here? if not, we should modify this if statement
      } else { // save button has been clicked and result variable contains new complex name
        complex.name = result;
        this.saveComplex(complex);
      }
      this.dialogRef = null;
    });
  }

  removeComplex(index: number): void {
    this.complexService.removeComplex(this.complexes[index].id).subscribe(() => {
      this.complexes.splice(index, 1);
      this.toast.showSuccess("Complex has been removed.");
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  addComplex(model: Complex, isValid: boolean): void {
    if (isValid) {
      this.complexService.addComplex(model).subscribe((newComplex: Complex) => {
        this.complexes.push(newComplex);
        this.complexForm.resetForm();
        this.toast.showSuccess("Complex has been created.");
      }, (msg: string) => {
        this.toast.showFailure(msg);
      });
    }
  }

  saveComplex(complex: Complex): void {
    this.complexService.updateComplex(complex).subscribe(() => {
      this.toast.showSuccess("Complex has been saved.");
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openComplex(complex: Complex): void {
    this.router.navigate(['building', complex.id]);
  }

  private newComplex(): void {
    this.complex = {
      name: ''
    };
  }

}
