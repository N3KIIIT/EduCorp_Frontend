import { ROLES } from '@/entities/session/model/constants';
import type { Role } from './Role';
import type { Permission } from './Permission';
import type { TelegramUserData } from '@/entities/user';


export class User {
    constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string | null,
        public readonly phoneNumber: string | null,
        public readonly telegramData: TelegramUserData | null,
        public readonly createdAt: Date,
        public readonly lastLogin: Date | null,
        public readonly isActive: boolean,
        public readonly roles: readonly Role[],
        public readonly directPermissions: readonly Permission[] = []
    ) { }


    get permissions(): readonly Permission[] {
        const rolePermissions = this.roles
            .filter(role => role.isActive)
            .flatMap(role => role.permissions);

        return [...rolePermissions, ...this.directPermissions];
    }


    get permissionNames(): readonly string[] {
        return Array.from(
            new Set(this.permissions.map(p => p.fullPermission))
        );
    }


    get roleNames(): readonly string[] {
        return this.roles
            .filter(role => role.isActive)
            .map(role => role.name);
    }


    get fullName(): string {
        return this.lastName
            ? `${this.firstName} ${this.lastName}`
            : this.firstName;
    }


    hasRole(roleName: string): boolean {
        return this.roles.some(
            role => role.name === roleName && role.isActive
        );
    }


    hasPermission(permission: string): boolean {
        return this.permissionNames.includes(permission);
    }


    hasAnyRole(roleNames: string[]): boolean {
        return roleNames.some(roleName => this.hasRole(roleName));
    }


    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    }


    get isAdmin(): boolean {
        return this.hasAnyRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    }
    
    
    get isSuperAdmin(): boolean {
        return this.hasRole(ROLES.SUPER_ADMIN);
    }


    get hasTelegramLinked(): boolean {
        return this.telegramData !== null;
    }
}
