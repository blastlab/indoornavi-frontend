export interface User {
  id?: number;
  username: string;
  password?: string;
  superUser?: boolean;
  permissionGroups: PermissionGroup[];
}

export interface Permission {
  id?: number;
  name: string;
}

export interface PermissionGroup {
  id?: number;
  name: string;
  permissions: Permission[];
}
