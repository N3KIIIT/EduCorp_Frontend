import type { PermissionResponse } from '@/lib/api-client/types.gen';
import { Permission } from '../../model/domain/Permission';

class PermissionMapper {
    toDomain(dto: PermissionResponse): Permission {
        return new Permission(
            dto.id,
            dto.resource,
            dto.action,
            null 
        );
    }

    toDomainList(dtos: PermissionResponse[]): Permission[] {
        return dtos.map(dto => this.toDomain(dto));
    }
}

export const permissionMapper = new PermissionMapper();
