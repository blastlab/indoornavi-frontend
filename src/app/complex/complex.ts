import {Component, OnInit, ViewChild} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from './complex.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ComplexDialogComponent} from './dilaog/complex.dialog';
import {ComplexConfirmComponent} from './complex.confirm';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {BuildingService} from '../building/building.service';
import {BreadcrumbService} from '../utils/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'complex.html',
  styleUrls: ['complex.css']
})
export class ComplexComponent implements OnInit {
  complex: Complex;
  complexes: Array<Complex> = [];
  dialogRef: MdDialogRef<ComplexDialogComponent>;

  confirmRef: MdDialogRef<ComplexConfirmComponent>;

  @ViewChild('complexForm') complexForm: NgForm;

  constructor(private complexService: ComplexService,
              private dialog: MdDialog,
              private toast: ToastService,
              public translate: TranslateService,
              private router: Router,
              private buildingService: BuildingService,
              private breadcrumbsService: BreadcrumbService,
              private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.newComplex();
    this.translateService.setDefaultLang('en');
    this.translateService.get(`complexes`).subscribe((value: string) => {
      this.breadcrumbsService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      this.complexes = complexes;
    });
  }

  editComplex(complex: Complex): void {
    this.dialogRef = this.dialog.open(ComplexDialogComponent);
    this.dialogRef.componentInstance.complex = {
      name: complex.name
    };

    this.dialogRef.afterClosed().subscribe((newComplex: Complex) => {
      if (newComplex !== undefined) { // dialog has been closed without save button clicked
        complex.name = newComplex.name;
        this.updateComplex(complex);
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
    this.buildingService.getComplexWithBuildings(complexId).subscribe((result: any) => {
      if (result.buildings && result.buildings.length) {
        this.openRemoveConfirmationDialog(index);
      } else {
        this.removeComplexRequest(index, complexId);
      }
    });
  }

  updateComplex(complexToUpdate: Complex): void {
    this.complexService.updateComplex(complexToUpdate).subscribe((complex: Complex) => {
      this.toast.showSuccess('complex.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openComplex(complex: Complex): void {
    this.router.navigate(['/complexes', complex.id, 'buildings']);
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(ComplexDialogComponent);
    this.dialogRef.componentInstance.complex = {
      id: null,
      name: ''
    };

    this.dialogRef.afterClosed().subscribe(complex => {
      if (complex !== undefined) {
        this.saveComplex(complex);
      }
      this.dialogRef = null;
    });
  }

  saveComplex(complex: Complex) {
    this.complexService.createComplex(complex).subscribe((newComplex: Complex) => {
      this.complexes.push(newComplex);
      this.toast.showSuccess('complex.create.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
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
