import {Component, OnInit, ViewChild} from '@angular/core';
import {Permission, PermissionGroup} from '../user/user.type';
import {PermissionGroupService} from 'app/user/permissionGroup/permissionGroup.service';
import {TranslateService} from '@ngx-translate/core';
import {NgForm} from '@angular/forms';
import {CrudComponent, CrudHelper} from '../../shared/components/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';
import {BreadcrumbService} from '../../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'permissionGroup.html'
})
export class PermissionGroupComponent implements OnInit, CrudComponent {
  loading: boolean = true;
  permissionGroups: PermissionGroup[] = [];
  dialogTitle: string;

  displayDialog: boolean = false;
  @ViewChild('permissionGroupForm') permissionGroupForm: NgForm;
  public permissionGroup: PermissionGroup;
  permissions: Permission[] = [];
  confirmBody: string;
  selectPermissionLabel: string;

  constructor(private messageService: MessageServiceWrapper,
              private permissionGroupService: PermissionGroupService,
              private translateService: TranslateService,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.setTranslations();
    this.loadData();
  }

  openDialog(permissionGroup?: PermissionGroup) {
    if (!!permissionGroup) {
      this.permissionGroup = {...permissionGroup};
      this.dialogTitle = 'permissionGroup.details.edit';
    } else {
      this.permissionGroup = new PermissionGroup();
      this.dialogTitle = 'permissionGroup.details.add';
    }
    this.displayDialog = true;
  }

  save(isValid: boolean) {
    if (isValid) {
      const isNew = !(!!this.permissionGroup.id);
      this.permissionGroupService.save(this.permissionGroup).first().subscribe((permissionGroup: PermissionGroup) => {
        if (isNew) {
          this.messageService.success('permissionGroup.create.success');
        } else {
          this.messageService.success('permissionGroup.save.success');
        }
        this.permissionGroups = <PermissionGroup[]>CrudHelper.add(permissionGroup, this.permissionGroups, isNew);
        this.permissionGroupForm.resetForm();
        this.displayDialog = false;
      }, (err: string) => {
        this.messageService.failed(err);
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
    this.translateService.get('permissionGroup.details.remove').subscribe((value: string) => {
      this.dialogTitle = value;
    });

    this.confirmationService.confirm({
      header: this.dialogTitle,
      message: this.confirmBody,
      accept: () => {
        this.permissionGroupService.remove(this.permissionGroups[index].id).first().subscribe(() => {
          this.permissionGroups = <PermissionGroup[]>CrudHelper.remove(index, this.permissionGroups);
          this.messageService.success('permissionGroup.remove.success');
        }, (err: string) => {
          this.messageService.failed(err);
        });
      }
    });
  }

  private setTranslations() {
    this.translateService.setDefaultLang('en');
    this.translateService.get('confirm.body').first().subscribe((value: string) => {
      this.confirmBody = value;
    });
    this.translateService.get('permissionGroup.selectPermission').first().subscribe((value: string) => {
      this.selectPermissionLabel = value;
    });
    this.translateService.get('permissionGroup.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
  }

  private loadData() {
    this.permissionGroupService.getPermissions().first().subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
    });
    this.permissionGroupService.getPermissionGroups().first().subscribe((permissionGroups: PermissionGroup[]) => {
      this.permissionGroups = permissionGroups;
      this.loading = false;
    });
  }

}
