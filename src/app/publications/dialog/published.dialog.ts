import {Component, OnInit} from '@angular/core';
import {PublishedMap} from '../../map-viewer/published.type';
import {Option} from '../../shared/utils/multiselect/multiselect.type';
import {Floor} from '../../floor/floor.type';
import {Building} from '../../building/building.type';
import {Complex} from '../../complex/complex.type';
import {UserService} from '../../user/user.service';
import {User} from '../../user/user.type';
import {ComplexService} from '../../complex/complex.service';
import {FloorService} from '../../floor/floor.service';
import {BuildingService} from 'app/building/building.service';
import {TranslateService} from '@ngx-translate/core';
import {MultiSelectUtils} from '../../shared/utils/multiselect/mutliselect.util';
import {PublishedService} from '../../map-viewer/published.service';
import {ToastService} from '../../shared/utils/toast/toast.service';
import {MdDialogRef} from '@angular/material';
import {DeviceService} from '../../device/device.service';
import {Tag} from '../../device/tag.type';
import {ActionBarService} from '../../map-editor/action-bar/actionbar.service';
import {Configuration} from '../../map-editor/action-bar/actionbar.type';

@Component({
  templateUrl: './published.dialog.html',
  styleUrls: ['./published.dialog.css']
})
export class PublishedDialogComponent implements OnInit {

  complexes: Complex[];
  selectedComplexId: number = null;
  buildings: Building[];
  selectedBuildingId: number = null;
  floors: Floor[];
  selectedFloorId: number = null;
  tags: Option[] = [];
  selectedTags: Option[] = [];
  tagSelectSettings = {badgeShowLimit: 3, maxHeight: 175, text: '', classes: 'tags'};
  users: Option[] = [];
  selectedUsers: Option[] = [];
  userSelectSettings = {badgeShowLimit: 3, maxHeight: 175, text: '', classes: 'users'};
  selectedMap: PublishedMap;

  constructor(private dialogRef: MdDialogRef<PublishedDialogComponent>,
              private deviceService: DeviceService,
              private userService: UserService,
              private complexService: ComplexService,
              private buildingService: BuildingService,
              private floorService: FloorService,
              private translateService: TranslateService,
              private publishedMapService: PublishedService,
              private toastService: ToastService,
              private actionBarService: ActionBarService) {
  }

  ngOnInit() {
    this.deviceService.setUrl('tags');
    this.deviceService.getAll().subscribe((tags: Tag[]) => {
      this.tags = this.getTagsOptions(tags);
    });

    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = this.getUsersOptions(users);
    });

    this.complexService.getComplexes().subscribe((complexes: Complex[]) => {
      this.complexes = complexes;
    });

    this.setTranslations();
  }

  public complexChanged(complexId: number) {
    this.selectedComplexId = complexId;
    this.selectedBuildingId = null;
    this.selectedFloorId = null;
    this.buildingService.getComplexWithBuildings(this.selectedComplexId).subscribe((complex: Complex) => {
      this.buildings = complex.buildings;
    });
  }

  public buildingChanged(buildingId: number) {
    this.selectedBuildingId = buildingId;
    this.selectedFloorId = null;
    this.floorService.getBuildingWithFloors(this.selectedBuildingId).subscribe((building: Building) => {
      this.floors = building.floors;
    });
  }

  public floorChanged(floorId: number) {
    this.selectedFloorId = floorId;
  }

  public save(isValid: boolean) {
    if (isValid) {
      const selectedFloor: Floor = this.floors.find((floor: Floor) => {
        return floor.id === this.selectedFloorId;
      });
      this.actionBarService.loadConfiguration(selectedFloor);
      this.actionBarService.configurationLoaded().first().subscribe((configuration: Configuration) => {
        if (!configuration.data.scale) {
          this.toastService.showFailure('publishedDialog.floor.scaleNotSet');
        } else if (!selectedFloor.imageId) {
          this.toastService.showFailure('publishedDialog.floor.imageNotSet');
        } else {
          this.publishedMapService.save({
            id: this.selectedMap ? this.selectedMap.id : null,
            floor: selectedFloor,
            tags: this.selectedTags.map(MultiSelectUtils.extractOptionData),
            users: this.selectedUsers.map(MultiSelectUtils.extractOptionData),
          }).subscribe((savedMap: PublishedMap) => {
            this.dialogRef.close(savedMap);
            this.clean();
            this.toastService.showSuccess('publishedList.save.success');
          }, (err: string) => {
            this.toastService.showFailure(err);
          });
        }
      });
    }
  }

  public setMap(map: PublishedMap) {
    if (!!map) {
      this.selectedComplexId = map.floor.building.complexId;
      this.complexChanged(this.selectedComplexId);
      this.selectedBuildingId = map.floor.building.id;
      this.buildingChanged(this.selectedBuildingId);
      this.selectedFloorId = map.floor.id;
      this.selectedTags = this.getTagsOptions(map.tags);
      this.selectedUsers = this.getUsersOptions(map.users);
      this.selectedMap = map;
    }
  }

  private getTagsOptions(tags: Tag[]) {
    const options: Option[] = [];
    tags.forEach((tag: Tag) => {
      options.push({id: tag.id, itemName: tag.shortId + ' - ' + tag.longId, data: tag});
    });
    return options;
  }

  private getUsersOptions(users: User[]): Option[] {
    const options: Option[] = [];
    users.forEach((user: User) => {
      options.push({id: user.id, itemName: user.username, data: user});
    });
    return options;
  }

  private clean() {
    this.selectedComplexId = null;
    this.selectedBuildingId = null;
    this.selectedFloorId = null;
    this.selectedTags = [];
    this.selectedUsers = [];
    this.selectedMap = null;
  }

  private setTranslations() {
    this.translateService.setDefaultLang('en');

    this.translateService.get('publishedList.users').subscribe((value: string) => {
      this.userSelectSettings.text = value;
    });

    this.translateService.get('publishedList.tags').subscribe((value: string) => {
      this.tagSelectSettings.text = value;
    });
  }
}
