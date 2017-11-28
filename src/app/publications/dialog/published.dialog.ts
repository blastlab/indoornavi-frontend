import {Component, OnInit, ViewChild} from '@angular/core';
import {PublishedMap} from '../../map-viewer/published.type';
import {Floor} from '../../floor/floor.type';
import {Building} from '../../building/building.type';
import {Complex} from '../../complex/complex.type';
import {UserService} from '../../user/user.service';
import {User} from '../../user/user.type';
import {ComplexService} from '../../complex/complex.service';
import {FloorService} from '../../floor/floor.service';
import {BuildingService} from 'app/building/building.service';
import {TranslateService} from '@ngx-translate/core';
import {PublishedService} from '../../map-viewer/published.service';
import {DeviceService} from '../../device/device.service';
import {Tag} from '../../device/tag.type';
import {ActionBarService} from '../../map-editor/action-bar/actionbar.service';
import {Configuration} from '../../map-editor/action-bar/actionbar.type';
import {SelectItem} from 'primeng/primeng';
import {CrudComponentForm, CrudHelper} from '../../utils/crud/crud.component';
import {NgForm} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MessageServiceWrapper} from '../../utils/message.service';

@Component({
  selector: 'app-published-dialog',
  templateUrl: './published.dialog.html',
  styleUrls: ['./published.dialog.css']
})
export class PublishedDialogComponent implements OnInit, CrudComponentForm {
  displayDialog: boolean = false;
  publishedMap: PublishedMap;
  complexes: Complex[];
  complex: Complex;
  buildings: Building[];
  building: Building;
  floors: SelectItem[];
  floor: Floor;
  tags: Tag[] = [];
  selectedTags: Tag[] = [];
  users: User[] = [];
  selectedUsers: User[] = [];
  selectedMap: PublishedMap;
  validationError: string;
  dialogClosed: Subject<PublishedMap> = new Subject<PublishedMap>();
  @ViewChild('publishedMapForm') publishedMapForm: NgForm;

  constructor(private deviceService: DeviceService,
              private userService: UserService,
              private complexService: ComplexService,
              private buildingService: BuildingService,
              private floorService: FloorService,
              private translateService: TranslateService,
              private publishedMapService: PublishedService,
              private messageService: MessageServiceWrapper,
              private actionBarService: ActionBarService) {
  }

  ngOnInit() {
    this.deviceService.setUrl('tags');
    this.deviceService.getAll().subscribe((tags: Tag[]) => {
      this.tags = tags;
    });

    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });

    this.complexService.getComplexes().subscribe((complexes: Complex[]) => {
      this.complexes = complexes;
    });

    this.translateService.setDefaultLang('en');
  }

  open(publishedMap?: PublishedMap): Observable<PublishedMap> {
    this.setMap(publishedMap);
    this.displayDialog = true;
    return this.dialogClosed.asObservable();
  }

  openWithFloor(floor: Floor): Observable<PublishedMap> {
    this.complex = floor.building.complex;
    this.complexChanged(this.complex);
    this.building = floor.building;
    this.buildingChanged(this.building);
    this.floor = floor;
    this.displayDialog = true;
    return this.dialogClosed.asObservable();
  }

  save(isValid: boolean) {
    if (isValid) {
      this.actionBarService.loadConfiguration(this.floor);
      this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration) => {
        if (!configuration.data.scale) {
          this.validationError = 'publishedDialog.floor.scaleNotSet';
        } else if (!this.floor.imageId) {
          this.validationError = 'publishedDialog.floor.imageNotSet';
        } else {
          this.publishedMapService.save({
            id: this.selectedMap ? this.selectedMap.id : null,
            floor: this.floor,
            tags: this.selectedTags,
            users: this.selectedUsers,
          }).subscribe((savedMap: PublishedMap) => {
            this.displayDialog = false;
            this.dialogClosed.next(savedMap);
            this.clean();
            this.messageService.success('publishedList.save.success');
          }, (err: string) => {
            this.messageService.failed(err);
          });
        }
      });
    } else {
      CrudHelper.validateAllFields(this.publishedMapForm);
    }
  }

  cancel() {
    this.displayDialog = false;
    this.clean();
  }

  complexChanged(complex: Complex) {
    this.complex = complex;
    this.building = null;
    this.floor = null;
    this.buildingService.getComplexWithBuildings(this.complex.id).subscribe((complexFromDb: Complex) => {
      this.buildings = complexFromDb.buildings;
    });
  }

  buildingChanged(building: Building) {
    this.building = building;
    this.floor = null;
    this.floorService.getBuildingWithFloors(this.building.id).subscribe((buildingFromDb: Building) => {
      this.floors = buildingFromDb.floors.map((floor: Floor) => {
        return {
          label: 'Level: ' + floor.level,
          value: floor
        }
      });
    });
  }

  floorChanged(floor: Floor) {
    this.floor = floor;
  }

  setMap(map: PublishedMap) {
    if (!!map) {
      this.publishedMap = map;
      this.complex = map.floor.building.complex;
      this.complexChanged(this.complex);
      this.building = map.floor.building;
      this.buildingChanged(this.building);
      this.floor = map.floor;
      this.selectedTags = map.tags;
      this.selectedUsers = map.users;
      this.selectedMap = map;
    }
  }

  private clean() {
    this.complex = null;
    this.building = null;
    this.floor = null;
    this.selectedTags = [];
    this.selectedUsers = [];
    this.selectedMap = null;
    this.publishedMapForm.resetForm();
  }
}
