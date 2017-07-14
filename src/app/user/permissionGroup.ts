import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MdDialog, MdDialogRef} from '@angular/material';
import {Permission, PermissionGroup} from './user.type';
import {ToastService} from '../utils/toast/toast.service';
import {PermissionGroupService} from 'app/user/permissionGroup.service';
import {TranslateService} from '@ngx-translate/core';
import {Option} from '../utils/multiselect/multiselect.type';

@Component({
  templateUrl: 'permissionGroup.html'
})
export class PermissionGroupComponent implements OnInit {
  dialogRef: MdDialogRef<MdDialog>;
  permissionGroups: PermissionGroup[] = [];

  @ViewChild('dialog', {read: TemplateRef}) dialogTemplate: TemplateRef<any>;
  public permissionGroup: PermissionGroup;
  permissions: Permission[] = [];
  options: Option[] = [];
  selectedOptions: Option[] = [];
  multiSelectSettings = {badgeShowLimit: 3, maxHeight: 175, text: ''};

  private static createEmptyPermissionGroup(): PermissionGroup {
    return <PermissionGroup>{
      name: '',
      permissions: []
    };
  }

  constructor(private dialog: MdDialog,
              private toast: ToastService,
              private permissionGroupService: PermissionGroupService,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.permissionGroup = PermissionGroupComponent.createEmptyPermissionGroup();
    this.translateService.setDefaultLang('en');
    this.translateService.get('permissionGroup.selectPermission').subscribe((value: string) => {
      this.multiSelectSettings.text = value;
    });
    this.permissionGroupService.getPermissions().subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
      this.permissions.forEach((permission: Permission) => {
        this.options.push({id: permission.id, itemName: permission.name});
      });
    });
    this.permissionGroupService.getPermissionGroups().subscribe((permissionGroups: PermissionGroup[]) => {
      this.permissionGroups = permissionGroups;
    });
  }

  openDialog() {
    this.dialogRef = this.dialog.open(this.dialogTemplate, {width: '500px', height: '400px'});
  }

  edit(permissionGroup: PermissionGroup) {
    this.permissionGroup = {...permissionGroup};
    this.selectedOptions = [];
    this.permissionGroup.permissions.forEach((permission: Permission) => {
      if (this.selectedOptions.map((option: Option) => {
          return option.id;
        }).indexOf(permission.id) === -1) {
        this.selectedOptions.push({id: permission.id, itemName: permission.name});
      }
    });
    this.openDialog();
  }

  save(isValid: boolean) {
    if (isValid) {
      const isEditMode = !!this.permissionGroup.id;
      this.permissionGroupService.save(this.permissionGroup).subscribe((permissionGroup: PermissionGroup) => {
        this.dialogRef.close();
        this.dialogRef = null;
        this.permissionGroup = PermissionGroupComponent.createEmptyPermissionGroup();
        this.selectedOptions = [];
        if (isEditMode) {
          this.permissionGroups.forEach((pG: PermissionGroup) => {
            if (pG.id === permissionGroup.id) {
              this.permissionGroups[this.permissionGroups.indexOf(pG)] = permissionGroup;
            }
          });
          this.toast.showSuccess('permissionGroup.save.success');
        } else {
          this.permissionGroups.push(permissionGroup);
          this.toast.showSuccess('permissionGroup.create.success');
        }
      }, (err: string) => {
        this.toast.showFailure(err);
      });
    }
  }

  remove(index: number) {
    this.permissionGroupService.remove(this.permissionGroups[index].id).subscribe(() => {
      this.permissionGroup = PermissionGroupComponent.createEmptyPermissionGroup();
      this.selectedOptions = [];
      this.permissionGroups.splice(index, 1);
      this.toast.showSuccess('permissionGroup.remove.success');
    }, (err: string) => {
      this.toast.showFailure(err);
    });
  }

  onItemSelect(item: Option) {
    this.permissionGroup.permissions.push(<Permission>{id: item.id, name: item.itemName});
  }

  onItemDeSelect(item: Option) {
    this.permissionGroup.permissions.splice(this.permissionGroup.permissions.map((p: Permission) => {
      return p.id;
    }).indexOf(item.id), 1);
  }

  onSelectAll(items: Option[]) {
    this.onDeSelectAll();
    items.forEach((item: Option) => {
      this.permissionGroup.permissions.push(<Permission>{id: item.id, name: item.itemName});
    });
  }

  onDeSelectAll() {
    this.permissionGroup.permissions = [];
  }

}
