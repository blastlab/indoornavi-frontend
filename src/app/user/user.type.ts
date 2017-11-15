export class User {
  id?: number;
  username: string;
  password?: string;
  superUser?: boolean;
  permissionGroups: PermissionGroup[];

  constructor() {
  }
}

export interface Permission {
  id?: number;
  name: string;
}

export class PermissionGroup {
  id?: number;
  name: string;
  permissions: Permission[] = [];

  constructor() {
  }
}
