
export class Permission {
    constructor(
        public readonly id: string,
        public readonly resource: string,
        public readonly action: string,
        public readonly description: string | null
    ) {}


    get fullPermission(): string {
        return `${this.resource}.${this.action}`;
    }


    matches(permission: string): boolean {
        return this.fullPermission === permission;
    }
}
