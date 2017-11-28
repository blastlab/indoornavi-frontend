import {Component, OnInit, ViewChild} from '@angular/core';
import {Permission, PermissionGroup} from '../user.type';
import {ToastService} from '../../utils/toast/toast.service';
import {PermissionGroupService} from 'app/user/permissionGroup/permissionGroup.service';
import {TranslateService} from '@ngx-translate/core';
import {NgForm} from '@angular/forms';
import {CrudComponent, CrudHelper} from '../../utils/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';

@Component({
  templateUrl: 'permissionGroup.html'
})
export class PermissionGroupComponent implements OnInit, CrudComponent {
  loading: boolean = true;
  permissionGroups: PermissionGroup[] = [];
  displayDialog: boolean = false;
  @ViewChild('permissionGroupForm') permissionGroupForm: NgForm;
  public permissionGroup: PermissionGroup;
  permissions: Permission[] = [];
  confirmBody: string;
  selectPermissionLabel: string;

  constructor(private toast: ToastService,
              private permissionGroupService: PermissionGroupService,
              private translateService: TranslateService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
    this.translateService.get('permissionGroup.selectPermission').subscribe((value: string) => {
      this.selectPermissionLabel = value;
    });
    this.permissionGroupService.getPermissions().subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
    });
    this.permissionGroupService.getPermissionGroups().subscribe((permissionGroups: PermissionGroup[]) => {
      this.permissionGroups = permissionGroups;
      this.loading = false;
    });
  }

  openDialog(permissionGroup?: PermissionGroup) {
    if (!!permissionGroup) {
      this.permissionGroup = {...permissionGroup};
    } else {
      this.permissionGroup = new PermissionGroup();
    }
    this.displayDialog = true;
  }

  save(isValid: boolean) {
    if (isValid) {
      const isNew = !(!!this.permissionGroup.id);
      this.permissionGroupService.save(this.permissionGroup).subscribe((permissionGroup: PermissionGroup) => {
        if (isNew) {
          this.toast.showSuccess('permissionGroup.create.success');
        } else {
          this.toast.showSuccess('permissionGroup.save.success');
        }
        this.permissionGroups = <PermissionGroup[]>CrudHelper.add(permissionGroup, this.permissionGroups, isNew);
        this.permissionGroupForm.resetForm();
        this.displayDialog = false;
      }, (err: string) => {
        this.toast.showFailure(err);
      });
    } else {
      CrudHelper.validateAllFields(this.permissionGroupForm);
    }
  }

  cancel(): void {
    this.permissionGroupForm.resetForm();
    this.displayDialog = false;
  }

  remove(index: number) {
    this.confirmationService.confirm({
      message: this.confirmBody,
      accept: () => {
        this.permissionGroupService.remove(this.permissionGroups[index].id).subscribe(() => {
          this.permissionGroups = <PermissionGroup[]>CrudHelper.remove(index, this.permissionGroups);
          this.toast.showSuccess('permissionGroup.remove.success');
        }, (err: string) => {
          this.toast.showFailure(err);
        });
      }
    });
  }

}
