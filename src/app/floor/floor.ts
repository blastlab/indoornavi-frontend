import {Component, OnInit, ViewChild} from '@angular/core';
import {Floor} from './floor.type';
import {FloorService} from './floor.service';
import {ToastService} from '../utils/toast/toast.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Building} from '../building/building.type';
import {CrudComponent, CrudHelper} from '../utils/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: 'floor.html',
  styleUrls: ['floor.css']
})
export class FloorComponent implements OnInit, CrudComponent {
  floor: Floor;
  building: Building = new Building();
  loading: boolean = true;
  displayDialog: boolean = false;
  @ViewChild('floorForm') floorForm: NgForm;
  private confirmBody: string;

  constructor(private floorService: FloorService,
              private toast: ToastService,
              public translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.route.params
      .subscribe((params: Params) => {
        const buildingId = +params['buildingId'];
        this.floorService.getBuildingWithFloors(buildingId).subscribe((building: Building) => {
          this.building = building;
          this.loading = false;
        });
      });
    this.translate.setDefaultLang('en');
  }

  openDialog(floor: Floor): void {
    if (!!floor) {
      this.floor = {...floor};
    } else {
      this.floor = new Floor('', this.getCurrentMaxLevel() + 1, this.building);
    }
    this.displayDialog = true;
  }

  save(isValid: boolean): void {
    (!!this.floor.id ?
        this.floorService.updateFloor(this.floor)
        :
        this.floorService.addFloor(this.floor)
    ).subscribe((savedFloor: Floor) => {
      const isNew = !(!!this.floor.id);
      if (isNew) {
        this.toast.showSuccess('floor.create.success');
      } else {
        this.toast.showSuccess('floor.save.success');
      }
      this.building.floors = <Floor[]>CrudHelper.add(savedFloor, this.building.floors, isNew).sort((a: Floor, b: Floor) => {
        return a.level - b.level;
      });
    }, (err: string) => {
      this.toast.showFailure(err);
    });
    this.displayDialog = false;
  }

  cancel(): void {
    this.displayDialog = false;
    this.floorForm.resetForm();
  }

  remove(index: number): void {
    this.confirmationService.confirm({
      message: this.confirmBody,
      accept: () => {
        const floorId: number = this.building.floors[index].id;
        this.floorService.removeFloor(floorId).subscribe(() => {
          this.building.floors = <Floor[]>CrudHelper.remove(index, this.building.floors);
          this.toast.showSuccess('floor.remove.success');
        }, (msg: string) => {
          this.toast.showFailure(msg);
        });
      }
    });
  }

  goTo(floor: Floor): void {
    this.router.navigate(['/complexes', this.building.complex.id, 'buildings', this.building.id, 'floors', floor.id, 'map']);
  }

  private getCurrentMaxLevel(): number {
    return this.building.floors.length ? Math.max.apply(Math, this.building.floors.map((floor: Floor) => {
      return floor.level;
    })) : -1;
  }
}
