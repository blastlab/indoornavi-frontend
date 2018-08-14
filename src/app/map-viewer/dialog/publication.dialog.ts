import {Component, OnInit, ViewChild} from '@angular/core';
import {Publication, ValidationResult} from '../publication.type';
import {Floor} from '../../floor/floor.type';
import {Building} from '../../building/building.type';
import {Complex} from '../../complex/complex.type';
import {UserService} from '../../user/user/user.service';
import {User} from '../../user/user/user.type';
import {ComplexService} from '../../complex/complex.service';
import {FloorService} from '../../floor/floor.service';
import {BuildingService} from 'app/building/building.service';
import {TranslateService} from '@ngx-translate/core';
import {PublishedService} from '../publication.service';
import {DeviceService} from '../../device/device.service';
import {ActionBarService} from '../../map-editor/action-bar/actionbar.service';
import {Configuration} from '../../map-editor/action-bar/actionbar.type';
import {CrudComponentForm, CrudHelper} from '../../shared/components/crud/crud.component';
import {NgForm} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';
import {SelectItem} from 'primeng/primeng';
import {Tag} from '../../device/device.type';

@Component({
  selector: 'app-publication-dialog',
  templateUrl: './publication.dialog.html'
})
export class PublicationDialogComponent implements OnInit, CrudComponentForm {
  displayDialog: boolean = false;
  complexes: Complex[] = [];
  dialogTitle: string;

  selectedComplexes: Complex[] = [];
  buildings: Building[] = [];
  selectedBuildings: Building[] = [];
  floors: SelectItem[] = [];
  selectedFloors: Floor[] = [];
  tags: Tag[] = [];
  tagsToSelect: SelectItem[] = [];
  selectedTags: number[] = [];
  users: User[] = [];
  selectedUsers: User[] = [];
  publication: Publication;
  validationError: string;
  dialogClosed: Subject<Publication> = new Subject<Publication>();
  @ViewChild('publishedMapForm') publishedMapForm: NgForm;
  tagsLabel: string;

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
      this.tagsToSelect = tags.map((tag: Tag) => {
        return {
          label: `${tag.shortId}`,
          value: tag.shortId
        };
      });
    });
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
    this.complexService.getComplexes().subscribe((complexes: Complex[]) => {
      this.complexes = complexes;
    });
    this.translateService.setDefaultLang('en');
    this.translateService.get('publishedList.tags.select').subscribe((value: string) => {
      this.tagsLabel = value;
    });
  }

  open(publishedMap?: Publication): Observable<Publication> {
    this.setMap(publishedMap);
    this.displayDialog = true;
    return this.dialogClosed.asObservable();
  }

  save(isValid: boolean) {
    if (isValid) {
      this.checkAndSave();
    } else {
      CrudHelper.validateAllFields(this.publishedMapForm);
    }
  }

  cancel() {
    this.displayDialog = false;
    this.dialogClosed.next(null);
    this.clean();
  }

  complexChanged() {
    this.buildings.length = 0;
    this.selectedComplexes.forEach((complex: Complex) => {
      this.buildingService.getComplexWithBuildings(complex.id).subscribe((complexFromDb: Complex) => {
        this.buildings = this.buildings.concat(complexFromDb.buildings);
      });
    });
  }

  buildingChanged() {
    this.floors.length = 0;
    this.selectedBuildings.forEach((building: Building) => {
      this.floorService.getBuildingWithFloors(building.id).subscribe((buildingFromDb: Building) => {
        this.floors = this.floors.concat(
          buildingFromDb.floors.map((floor: Floor) => {
            return {
              label: `${floor.building.name}: ${floor.level}`,
              value: floor
            }
          })
        );
      });
    });
  }

  setMap(map: Publication) {
    if (!!map) {
      this.dialogTitle = 'publishedMap.details.edit';
      this.selectedComplexes = map.floors.map(floor => {
        return floor.building.complex;
      });
      this.complexChanged();
      this.selectedBuildings = map.floors.map(floor => {
        return floor.building;
      });
      this.buildingChanged();
      this.selectedFloors = map.floors;
      this.selectedTags = map.tags.map((tag: Tag) => {
        return tag.shortId;
      });
      this.selectedUsers = map.users;
      this.publication = map;
    } else {
      this.dialogTitle = 'publishedMap.details.add';
    }
  }

  private clean() {
    this.publishedMapForm.resetForm();
    this.selectedComplexes = [];
    this.selectedBuildings = [];
    this.selectedFloors = [];
    this.selectedTags = [];
    this.selectedUsers = [];
    this.publication = null;
    this.validationError = '';
  }

  private setValidationError(type: string) {
    this.publishedMapForm.controls[type].setErrors({
      'required':
        {'message': `publishedDialog.${type}.required`}
    });
  }

  private checkAndSave() {
    this.checkScaleAndImage().then((validationResult) => {
      if (!validationResult.scaleSet) {
        this.validationError = 'publishedDialog.floor.scaleNotSet';
      } else if (!validationResult.imageSet) {
        this.validationError = 'publishedDialog.floor.imageNotSet';
      } else if (this.selectedTags.length === 0) {
        this.setValidationError('tags');
      } else if (this.selectedUsers.length === 0) {
        this.setValidationError('users');
      } else {
        this.publishedMapService.save({
          id: this.publication ? this.publication.id : null,
          floors: this.selectedFloors,
          tags: this.mapToTags(this.selectedTags),
          users: this.selectedUsers,
        }).subscribe((savedMap: Publication) => {
          this.displayDialog = false;
          this.dialogClosed.next(savedMap);
          this.clean();
          this.messageService.success('publishedList.save.success');
        }, (err: string) => {
          this.messageService.failed(err);
        });
      }
    });
  }

  private mapToTags(tagsShortIds: number[]): Tag[] {
    return tagsShortIds.map((shortId: number) => {
      return this.tags.find((tag: Tag) => {
        return tag.shortId === shortId;
      });
    });
  }


  private checkScaleAndImage(): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const observables: Observable<Configuration>[] = [];
      this.selectedFloors.forEach((floor: Floor) => {
        if (!floor.imageId) {
          resolve({
            imageSet: false
          });
        }
        this.actionBarService.loadConfiguration(floor);
        observables.push(this.actionBarService.configurationLoaded().first());
      });

      Observable.combineLatest(observables).subscribe((configurations: Configuration[]) => {
          configurations.forEach((configuration: Configuration) => {
            if (!configuration.data.scale) {
              resolve({
                scaleSet: false
              });
            }
          });
          resolve({
            scaleSet: true,
            imageSet: true
          });
        }
      );
    });
  }
}
