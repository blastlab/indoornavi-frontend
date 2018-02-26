import {Component, OnInit, ViewChild} from '@angular/core';
import {Complex} from './complex.type';
import {ComplexService} from './complex.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'complex.html'
})
export class ComplexComponent implements OnInit, CrudComponent {
  complex: Complex;
  complexes: Complex[] = [];

  loading: boolean = true;
  displayDialog: boolean = false;
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
    this.complexService.getComplexes().subscribe((complexes: Array<Complex>) => {
      this.complexes = complexes;
      this.loading = false;
    });

    this.translate.setDefaultLang('en');
    this.translate.get(`complexes`).subscribe((value: string) => {
      this.breadcrumbsService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.translate.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
  }

  openDialog(complex?: Complex): void {
    if (!!complex) {
      this.complex = {...complex};
    } else {
      this.complex = new Complex('', []);
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
      message: this.confirmBody,
      accept: () => {
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
