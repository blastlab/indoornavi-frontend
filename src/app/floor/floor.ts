import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Floor} from './floor.type';
import {FloorService} from './floor.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Building} from '../building/building.type';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {NgForm} from '@angular/forms';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Subject} from 'rxjs/Subject';

@Component({
  templateUrl: 'floor.html'
})
export class FloorComponent implements OnInit, OnDestroy, CrudComponent {
  floor: Floor;
  dialogTitle: string;
  removeDialogTitle: string;

  building: Building = new Building();
  loading: boolean = true;
  displayDialog: boolean = false;
  subscriptionDestructor: Subject<void> = new Subject<void>();
  @ViewChild('floorForm') floorForm: NgForm;
  private confirmBody: string;

  constructor(private floorService: FloorService,
              public translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private confirmationService: ConfirmationService,
              private breadcrumbsService: BreadcrumbService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit(): void {
    this.route.params.takeUntil(this.subscriptionDestructor)
      .subscribe((params: Params) => {
        const buildingId = +params['buildingId'];
        this.floorService.getBuildingWithFloors(buildingId).takeUntil(this.subscriptionDestructor)
          .subscribe((building: Building) => {
          this.building = building;
          this.loading = false;
          this.breadcrumbsService.publishIsReady([
            {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
            {
              label: building.complex.name,
              routerLink: `/complexes/${this.building.complex.id}/buildings`,
              routerLinkActiveOptions: {exact: true}
            },
            {label: building.name, disabled: true}
          ]);
          });
      });
    this.translate.setDefaultLang('en');
    this.translate.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
    this.translate.get('floor.details.remove').subscribe((value: string) => {
      this.removeDialogTitle = value;
    });
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  openDialog(floor?: Floor): void {
    if (!!floor) {
      this.floor = {...floor};
      this.dialogTitle = 'floor.details.edit';
    } else {
      this.floor = new Floor('', this.getCurrentMaxLevel() + 1, this.building);
      this.dialogTitle = 'floor.details.add';
    }
    this.displayDialog = true;
  }

  save(isValid: boolean): void {
    if (isValid) {
      (!!this.floor.id ?
          this.floorService.updateFloor(this.floor)
          :
          this.floorService.addFloor(this.floor)
      ).subscribe((savedFloor: Floor) => {
        const isNew = !(!!this.floor.id);
        if (isNew) {
          this.messageService.success('floor.create.success');
        } else {
          this.messageService.success('floor.save.success');
        }
        this.building.floors = <Floor[]>CrudHelper.add(savedFloor, this.building.floors, isNew).sort((a: Floor, b: Floor) => {
          return a.level - b.level;
        });
      }, (err: string) => {
        this.messageService.failed(err);
      });
      this.displayDialog = false;
    } else {
      CrudHelper.validateAllFields(this.floorForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.floorForm.resetForm();
  }

  remove(index: number): void {
    this.confirmationService.confirm({
      header: this.removeDialogTitle,
      message: this.confirmBody,
      accept: () => {
        const floorId: number = this.building.floors[index].id;
        this.floorService.removeFloor(floorId).subscribe(() => {
          this.building.floors = <Floor[]>CrudHelper.remove(index, this.building.floors);
          this.messageService.success('floor.remove.success');
        }, (msg: string) => {
          this.messageService.failed(msg);
        });
      }
    });
  }

  goToEditor(floor: Floor): void {
    this.router.navigate(['/complexes', this.building.complex.id, 'buildings', this.building.id, 'floors', floor.id, 'map']);
  }

  goToMap(floor: Floor): void {
    this.router.navigate(['/publications', floor.id]);
  }

  goToHeatMap(floor: Floor): void {
    this.router.navigate(['/analytics', floor.id]);
  }

  goToReports(floor: Floor): void {
    this.router.navigate(['/reports', floor.id]);
  }

  private getCurrentMaxLevel(): number {
    return this.building.floors.length ? Math.max.apply(Math, this.building.floors.map((floor: Floor) => {
      return floor.level;
    })) : -1;
  }

  onFloorLevelKeyDown() {
    const control = this.floorForm.controls['level'];
    control.markAsTouched({onlySelf: true});
    control.markAsDirty({onlySelf: true});
  }
}
