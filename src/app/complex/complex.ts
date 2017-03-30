import {Component, OnInit, ViewChild} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from './complex.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ComplexDialogComponent} from './complex.dialog';
import {ComplexConfirmComponent} from './complex.confirm';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {BuildingService} from '../building/building.service';

@Component({
  selector: 'app-root',
  templateUrl: 'complex.html',
  styleUrls: ['complex.css']
})

export class ComplexComponent implements OnInit {
  complex: Complex;
  complexes: Array<Complex> = [];

  dialogRef: MdDialogRef<ComplexDialogComponent>;
  confirmRef: MdDialogRef<ComplexConfirmComponent>;

  @ViewChild('complexForm') complexForm: NgForm;

  ngOnInit(): void {
    this.newComplex();

    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      this.complexes = complexes;
    });

    this.translate.setDefaultLang('en');
  }

  constructor(private complexService: ComplexService,
              private dialog: MdDialog,
              private toast: ToastService,
              public translate: TranslateService,
              private router: Router,
              private buildingService: BuildingService) {
  }

  editComplex(complex: Complex): void {
    this.dialogRef = this.dialog.open(ComplexDialogComponent);
    this.dialogRef.componentInstance.name = complex.name;

    this.dialogRef.afterClosed().subscribe(newComplexName => {
      if (newComplexName === undefined) { // dialog has been closed without save button clicked
        // TODO: do we do anything here? if not, we should modify this if statement
      } else { // save button has been clicked and newComplexName variable contains new complex name
        this.saveComplex({name: newComplexName});
      }
      this.dialogRef = null;
    });
  }

  openRemoveConfirmationDialog(index: number): void {
    this.confirmRef = this.dialog.open(ComplexConfirmComponent);
    const complexId: number = this.complexes[index].id;

    this.confirmRef.afterClosed().subscribe(state => {
      if (state) {
        this.removeComplexRequest(index, complexId);
      }
      this.dialogRef = null;
    });
  }

  removeComplex(index: number): void {
    const complexId: number = this.complexes[index].id;
    this.buildingService.getBuildings(complexId).subscribe((result: any) => {
      if (result.buildings && result.buildings.length) {
        this.openRemoveConfirmationDialog(index);
      } else {
        this.removeComplexRequest(index, complexId);
      }
    });
  }

  addComplex(model: Complex, isValid: boolean): void {
    if (isValid) {
      this.complexService.addComplex(model).subscribe((newComplex: Complex) => {
        this.complexes.push(newComplex);
        this.complexForm.resetForm();
        this.toast.showSuccess('complex.create.success');
      }, (msg: string) => {
        this.toast.showFailure(msg);
      });
    }
  }

  saveComplex(complexToUpdate: Complex): void {
    this.complexService.updateComplex(complexToUpdate).subscribe((complex: Complex) => {
      this.complex = complex;
      this.toast.showSuccess('complex.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openComplex(complex: Complex): void {
    this.router.navigate(['/complexes', complex.id, 'buildings']);
  }

  private removeComplexRequest(index: number, complexId: number) {
    this.complexService.removeComplex(complexId).subscribe(() => {
      this.complexes.splice(index, 1);
      this.toast.showSuccess('complex.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  private newComplex(): void {
    this.complex = {
      name: ''
    };
  }

}
