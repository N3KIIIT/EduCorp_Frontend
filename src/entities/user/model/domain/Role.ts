import type { Permission } from './Permission';


export class Role {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly displayName: string,
        public readonly description: string | null,
        public readonly isActive: boolean,
        public readonly permissions: readonly Permission[]
    ) {}


    get permissionNames(): readonly string[] {
        return this.permissions.map(p => p.fullPermission);
    }


    hasPermission(permission: string): boolean {
        return this.permissions.some(p => p.fullPermission === permission);
    }
}
