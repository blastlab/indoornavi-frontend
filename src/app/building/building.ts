import {Component, OnInit, ViewChild} from '@angular/core';
import {Building} from './building.type';
import {BuildingService} from './building.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Complex} from '../complex/complex.type';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';

@Component({
  templateUrl: 'building.html',
  styleUrls: ['building.css']
})
export class BuildingComponent implements OnInit, CrudComponent {
  complex: Complex = new Complex();
  building: Building;
  loading: boolean = true;
  displayDialog: boolean = false;
  confirmBody: string;
  @ViewChild('buildingForm') buildingForm: NgForm;

  constructor(private buildingService: BuildingService,
              private messageService: MessageServiceWrapper,
              public translate: TranslateService,
              private router: Router,
              private route: ActivatedRoute,
              private confirmationService: ConfirmationService,
              private breadcrumbsService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const complexId = +params['complexId'];
      this.buildingService.getComplexWithBuildings(complexId).subscribe((complex: Complex) => {
        this.complex = complex;
        this.loading = false;
        this.breadcrumbsService.publishIsReady([
          {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
          {label: complex.name, disabled: true}
        ]);
      });
    });
    this.translate.setDefaultLang('en');
    this.translate.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
  }

  openDialog(building?: Building): void {
    if (!!building) {
      this.building = {...building};
    } else {
      this.building = new Building('', this.complex, []);
    }
    this.displayDialog = true;
  }

  save(isValid: boolean): void {
    if (isValid) {
      (!!this.building.id ?
          this.buildingService.updateBuilding(this.building)
          :
          this.buildingService.addBuilding(this.building)
      ).subscribe((savedBuilding: Building) => {
        const isNew = !(!!this.building.id);
        if (isNew) {
          this.messageService.success('building.create.success');
        } else {
          this.messageService.success('building.save.success');
        }
        this.complex.buildings = <Building[]>CrudHelper.add(savedBuilding, this.complex.buildings, isNew);
      }, (err: string) => {
        this.messageService.failed(err);
      });
      this.buildingForm.resetForm();
      this.displayDialog = false;
    } else {
      CrudHelper.validateAllFields(this.buildingForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.buildingForm.resetForm();
  }

  remove(index: number): void {
    this.confirmationService.confirm({
        message: this.confirmBody,
        accept: () => {
          const buildingId: number = this.complex.buildings[index].id;
          this.buildingService.removeBuilding(buildingId).subscribe(() => {
            this.complex.buildings = <Building[]>CrudHelper.remove(index, this.complex.buildings);
            this.messageService.success('building.remove.success');
          }, (msg: string) => {
            this.messageService.failed(msg);
          });
        }
    });
  }

  goTo(building: Building): void {
    this.router.navigate(['/complexes', this.complex.id, 'buildings', building.id, 'floors']);
  }
}
