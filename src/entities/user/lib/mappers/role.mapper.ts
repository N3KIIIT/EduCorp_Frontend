import type { RoleResponse } from '@/lib/api-client/types.gen';
import { Role } from '@/entities/user';
import { permissionMapper } from './permission.mapper';


class RoleMapper {
    toDomain(dto: RoleResponse): Role {
        return new Role(
            dto.id,
            dto.name,
            dto.displayName,
            dto.description ?? null,
            dto.isActive,
            dto.permissions.map(permDto => permissionMapper.toDomain(permDto))
        );
    }

    toDomainList(dtos: RoleResponse[]): Role[] {
        return dtos.map(dto => this.toDomain(dto));
    }

    toDomainFromBrief(dto: { id: string; name: string; displayName: string }): Role {
        return new Role(
            dto.id,
            dto.name,
            dto.displayName,
            null,
            true,
            []);
    }
}

export const roleMapper = new RoleMapper();
