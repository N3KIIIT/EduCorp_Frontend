/**
 * Централизованная конфигурация прав доступа (Permissions)
 * Соответствует ресурсам и действиям на бэкенде.
 */
export const PERMISSIONS = {
  USERS: {
    VIEW: "Users.View",
    EDIT: "Users.Edit",
    DELETE: "Users.Delete",
    MANAGE_ROLES: "Users.ManageRoles",
  },
  ROLES: {
    VIEW: "Roles.View",
    EDIT: "Roles.Edit",
    CREATE: "Roles.Create",
    DELETE: "Roles.Delete",
  },
  TENANTS: {
    VIEW: "Tenants.View",
    CREATE: "Tenants.Create",
    EDIT: "Tenants.Edit",
    DELETE: "Tenants.Delete",
  },
} as const;

/**
 * Централизованная конфигурация ролей (Roles)
 */
export const ROLES = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  USER: "User",
  MANAGER: "Manager",
  VIEWER: "Viewer",
} as const;

export type PermissionType =
  | (typeof PERMISSIONS.USERS)[keyof typeof PERMISSIONS.USERS]
  | (typeof PERMISSIONS.ROLES)[keyof typeof PERMISSIONS.ROLES]
  | (typeof PERMISSIONS.TENANTS)[keyof typeof PERMISSIONS.TENANTS];

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
