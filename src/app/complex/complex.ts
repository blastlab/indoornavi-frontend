import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from './complex.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Subject} from 'rxjs/Subject';

@Component({
  templateUrl: 'complex.html'
})
export class ComplexComponent implements OnInit, OnDestroy, CrudComponent {
  complex: Complex;
  complexes: Complex[] = [];
  dialogTitle: string;
  removeDialogTitle: string;

  loading: boolean = true;
  displayDialog: boolean = false;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private confirmBody: string;
  @ViewChild('complexForm') complexForm: NgForm;

  constructor(private complexService: ComplexService,
              public translate: TranslateService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private breadcrumbsService: BreadcrumbService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit(): void {
    this.complexService.getComplexes().takeUntil(this.subscriptionDestructor)
      .subscribe((complexes: Array<Complex>) => {
        this.complexes = complexes;
      this.loading = false;
    });

    this.translate.setDefaultLang('en');
    this.translate.get(`complexes`).subscribe((value: string) => {
      this.breadcrumbsService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.translate.get('confirm.body').first()
      .subscribe((value: string) => {
      this.confirmBody = value;
    });
    this.translate.get('complex.details.remove')
      .first().subscribe((value: string) => {
      this.removeDialogTitle = value;
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  openDialog(complex?: Complex): void {
    if (!!complex) {
      this.complex = {...complex};
      this.dialogTitle = 'complex.details.edit';
    } else {
      this.complex = new Complex('', []);
      this.dialogTitle = 'complex.details.add';
    }
    this.displayDialog = true;
  }

  save(isValid: boolean): void {
    if (isValid) {
      (!!this.complex.id ?
          this.complexService.updateComplex(this.complex)
          :
          this.complexService.createComplex(this.complex)
      ).subscribe((savedComplex: Complex) => {
        const isNew = !(!!this.complex.id);
        if (isNew) {
          this.messageService.success('complex.create.success');
        } else {
          this.messageService.success('complex.save.success');
        }
        this.complexes = <Complex[]>CrudHelper.add(savedComplex, this.complexes, isNew);
      }, (err: string) => {
        this.messageService.failed(err);
      });
      this.displayDialog = false;
      this.complexForm.resetForm();
    } else {
      CrudHelper.validateAllFields(this.complexForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.complexForm.resetForm();
  }

  remove(index: number): void {
    this.confirmationService.confirm({
      header: this.removeDialogTitle,
      message: this.confirmBody,
      accept: (): void => {
        const complexId: number = this.complexes[index].id;
        this.complexService.removeComplex(complexId).subscribe(() => {
          this.complexes = <Complex[]>CrudHelper.remove(index, this.complexes);
          this.messageService.success('complex.remove.success');
        }, (msg: string) => {
          this.messageService.failed(msg);
        });
      }
    });
  }

  goTo(complex: Complex): void {
    this.router.navigate(['/complexes', complex.id, 'buildings']);
  }
}
